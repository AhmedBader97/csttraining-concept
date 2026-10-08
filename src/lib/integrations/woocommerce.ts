import type { Course } from '@/content/courses';
import { getVenue } from '@/content/venues';
import type { BasketItem, BasketState } from '../basket';
import { deliveryLabels } from '@/content/courses';
import { normaliseUkPhone, type CustomerDetails } from '../validation';

/**
 * Headless WooCommerce: the shapes this front end would exchange with a
 * WordPress + WooCommerce back end. Nothing here makes a network call; the
 * checkout shows these payloads instead of sending them.
 */

export interface WooMeta {
  key: string;
  value: string;
}

export interface WooOrderPayload {
  status: 'pending';
  currency: 'GBP';
  set_paid: false;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    email: string;
    phone: string;
    country: 'GB';
  };
  line_items: Array<{ product_id: number; quantity: number; meta_data: WooMeta[] }>;
  customer_note: string;
  meta_data: WooMeta[];
}

/**
 * Stand-in product IDs. A real build would read them from the Store API;
 * here they're derived from the slug so they're stable between runs.
 */
export function wooProductId(slug: string): number {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 1000 + (hash % 9000);
}

function lineMeta(item: BasketItem): WooMeta[] {
  const meta: WooMeta[] = [];
  if (item.delivery) meta.push({ key: 'Delivery', value: deliveryLabels[item.delivery] });
  if (item.venue) meta.push({ key: 'Venue', value: getVenue(item.venue)?.name ?? item.venue });
  if (item.date) meta.push({ key: 'Start date', value: item.date });
  if (item.unitPrice == null) meta.push({ key: 'Price', value: 'To be confirmed by a coordinator' });
  return meta;
}

/** POST /wp-json/wc/v3/orders body for the basket. */
export function toWooOrder(basket: BasketState, customer: CustomerDetails, bulkEligible: boolean): WooOrderPayload {
  return {
    status: 'pending',
    currency: 'GBP',
    set_paid: false,
    billing: {
      first_name: customer.firstName.trim(),
      last_name: customer.lastName.trim(),
      company: customer.company.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: normaliseUkPhone(customer.phone) ?? customer.phone.trim(),
      country: 'GB',
    },
    line_items: basket.items.map((item) => ({
      product_id: wooProductId(item.slug),
      quantity: item.places,
      meta_data: lineMeta(item),
    })),
    customer_note: customer.notes.trim(),
    meta_data: [
      { key: '_citb_registered_employer', value: customer.citbRegistered ? 'yes' : 'no' },
      { key: '_bulk_booking', value: bulkEligible ? 'yes' : 'no' },
      { key: '_source', value: 'website-concept' },
    ],
  };
}

/**
 * A product as the WooCommerce Store API returns it
 * (GET /wp-json/wc/store/v1/products). Prices are strings in minor units.
 */
export interface WooStoreProduct {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  prices: { price: string; regular_price: string; sale_price: string; currency_minor_unit: number; currency_code: string };
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ name: string; terms: Array<{ name: string }> }>;
  is_purchasable: boolean;
}

function fromMinor(value: string, minorUnit: number): number | null {
  if (!value) return null;
  const amount = Number(value) / 10 ** minorUnit;
  return Number.isFinite(amount) ? amount : null;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Maps a Store API product onto the fields the course pages use, so the
 * front end can switch from local content to WooCommerce without changes.
 */
export function fromWooProduct(product: WooStoreProduct): Pick<Course, 'slug' | 'name' | 'summary' | 'price' | 'wasPrice' | 'duration' | 'delivery'> {
  const minor = product.prices.currency_minor_unit;
  const price = fromMinor(product.prices.price, minor);
  const regular = fromMinor(product.prices.regular_price, minor);
  const attribute = (name: string) => product.attributes.find((a) => a.name.toLowerCase() === name)?.terms.map((t) => t.name) ?? [];
  const delivery = attribute('delivery')
    .map((term) => term.toLowerCase())
    .map((term) => (term.includes('class') ? 'classroom' : term.includes('e-learn') ? 'e-learning' : 'online'));
  return {
    slug: product.slug,
    name: product.name,
    summary: stripTags(product.short_description),
    // Store API prices include VAT when the shop is set to show them that way; this shop shows prices + VAT.
    price,
    wasPrice: regular != null && price != null && regular > price ? regular : undefined,
    duration: attribute('duration')[0] ?? '',
    delivery: Array.from(new Set(delivery)) as Course['delivery'],
  };
}
