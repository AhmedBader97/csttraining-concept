import { basketReducer, basketTotals, emptyBasket } from '../basket';
import { contactUpsert, dealCreate, DEAL_TO_CONTACT } from '../integrations/hubspot';
import { bookingEvent, renewalReminders, workflowSteps } from '../integrations/n8n';
import { fromWooProduct, toWooOrder, wooProductId, type WooStoreProduct } from '../integrations/woocommerce';

const customer = {
  firstName: ' Sam ',
  lastName: 'Reilly',
  email: 'Sam.Reilly@Example.com',
  phone: '07700 900123',
  company: 'Northfield Build Ltd',
  citbRegistered: true,
  notes: 'Two of us need weekend dates.',
};

let basket = basketReducer(emptyBasket, {
  type: 'add',
  item: { kind: 'course', slug: 'smsts', name: 'SMSTS', unitPrice: 495, delivery: 'classroom', venue: 'leeds', date: '2026-11-02', places: 2 },
});
basket = basketReducer(basket, { type: 'add', item: { kind: 'nvq', slug: 'bricklaying-level-2', name: 'Level 2 NVQ in Bricklaying', unitPrice: 895 } });
const totals = basketTotals(basket);

describe('WooCommerce', () => {
  it('builds an order the REST API accepts', () => {
    const order = toWooOrder(basket, customer, totals.bulkEligible);
    expect(order.billing).toMatchObject({ first_name: 'Sam', email: 'sam.reilly@example.com', phone: '+447700900123', country: 'GB' });
    expect(order.line_items[0]).toEqual({
      product_id: wooProductId('smsts'),
      quantity: 2,
      meta_data: [
        { key: 'Delivery', value: 'Classroom' },
        { key: 'Venue', value: 'Leeds Venue' },
        { key: 'Start date', value: '2026-11-02' },
      ],
    });
    expect(order.meta_data).toContainEqual({ key: '_citb_registered_employer', value: 'yes' });
    expect(order.set_paid).toBe(false);
  });

  it('gives each product a stable ID', () => {
    expect(wooProductId('smsts')).toBe(wooProductId('smsts'));
    expect(wooProductId('smsts')).not.toBe(wooProductId('sssts'));
  });

  it('reads a Store API product, prices in pence', () => {
    const product: WooStoreProduct = {
      id: 12,
      name: 'CITB SSSTS',
      slug: 'sssts',
      short_description: '<p>Two-day <strong>supervisor</strong> course.</p>',
      prices: { price: '27500', regular_price: '45000', sale_price: '27500', currency_minor_unit: 2, currency_code: 'GBP' },
      categories: [],
      attributes: [
        { name: 'Delivery', terms: [{ name: 'Online' }, { name: 'Classroom' }] },
        { name: 'Duration', terms: [{ name: '2 days' }] },
      ],
      is_purchasable: true,
    };
    expect(fromWooProduct(product)).toEqual({
      slug: 'sssts',
      name: 'CITB SSSTS',
      summary: 'Two-day supervisor course.',
      price: 275,
      wasPrice: 450,
      duration: '2 days',
      delivery: ['online', 'classroom'],
    });
  });
});

describe('HubSpot', () => {
  it('upserts the contact by email', () => {
    const request = contactUpsert(customer);
    expect(request.path).toBe('/crm/v3/objects/contacts/batch/upsert');
    expect(request.body.inputs[0]).toMatchObject({ idProperty: 'email', id: 'sam.reilly@example.com' });
    expect(request.body.inputs[0]?.properties).toMatchObject({ firstname: 'Sam', phone: '+447700900123', company: 'Northfield Build Ltd' });
  });

  it('creates a deal for the booking, linked to the contact', () => {
    const request = dealCreate(basket, customer, totals, '501');
    expect(request.body.properties).toMatchObject({ dealname: 'SMSTS ×2 + 1 more: Northfield Build Ltd', amount: '1885.00', places: '3' });
    expect(request.body.associations[0]).toEqual({
      to: { id: '501' },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: DEAL_TO_CONTACT }],
    });
  });
});

describe('n8n', () => {
  it('schedules a renewal reminder 3 months before the certificate expires', () => {
    expect(renewalReminders(basket)).toEqual([
      { course: 'SMSTS', certificateExpires: '2031-11-02', remindOn: '2031-08-02', renewWith: 'SMSTS Refresher' },
    ]);
  });

  it('only alerts a coordinator when a booking needs a call', () => {
    const event = bookingEvent(basket, customer, totals, new Date('2026-10-08T12:00:00Z'));
    const coordinator = workflowSteps.find((step) => step.id === 'coordinator')!;
    expect(coordinator.when?.(event)).toBe(false);
    expect(coordinator.when?.({ ...event, bulk_booking: true })).toBe(true);
    expect(event.totals).toEqual({ places: 3, net: '1885.00', vat: '377.00', gross: '2262.00' });
  });
});
