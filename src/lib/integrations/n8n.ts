import { getCourse } from '@/content/courses';
import type { BasketState, BasketTotals } from '../basket';
import { addMonths, addYears } from '../dates';
import type { CustomerDetails } from '../validation';

/**
 * The event WooCommerce sends to n8n when an order comes in (see
 * integrations/woocommerce/cst-booking-webhook.php), and the steps the
 * workflow in integrations/n8n/booking-to-hubspot.json takes with it.
 */

export interface RenewalReminder {
  course: string;
  certificateExpires: string;
  remindOn: string;
  renewWith: string;
}

/** Courses with a certificate that expires get a reminder 3 months before. */
export function renewalReminders(basket: BasketState): RenewalReminder[] {
  const reminders: RenewalReminder[] = [];
  for (const item of basket.items) {
    if (item.kind !== 'course' || !item.date) continue;
    const course = getCourse(item.slug);
    if (!course?.validityYears) continue;
    const expires = addYears(item.date, course.validityYears);
    const renewWith = course.refresher ? getCourse(course.refresher)?.name ?? course.refresher : course.name;
    reminders.push({ course: course.name, certificateExpires: expires, remindOn: addMonths(expires, -3), renewWith });
  }
  return reminders;
}

export interface BookingEvent {
  event: 'booking.created';
  occurred_at: string;
  customer: { email: string; company: string; citb_registered: boolean };
  totals: { places: number; net: string; vat: string; gross: string };
  bulk_booking: boolean;
  price_to_confirm: boolean;
  renewals: RenewalReminder[];
}

export function bookingEvent(basket: BasketState, customer: CustomerDetails, totals: BasketTotals, now: Date): BookingEvent {
  return {
    event: 'booking.created',
    occurred_at: now.toISOString(),
    customer: { email: customer.email.trim().toLowerCase(), company: customer.company.trim(), citb_registered: customer.citbRegistered },
    totals: { places: totals.places, net: totals.net.toFixed(2), vat: totals.vat.toFixed(2), gross: totals.gross.toFixed(2) },
    bulk_booking: totals.bulkEligible,
    price_to_confirm: totals.linesOnRequest > 0,
    renewals: renewalReminders(basket),
  };
}

export interface WorkflowStep {
  id: string;
  title: string;
  detail: string;
  /** Only runs when this is true for the booking. */
  when?: (event: BookingEvent) => boolean;
}

export const workflowSteps: WorkflowStep[] = [
  { id: 'webhook', title: 'Order received', detail: 'WooCommerce posts the order to the n8n webhook.' },
  { id: 'contact', title: 'Contact upserted in HubSpot', detail: 'Matched on email, so returning customers aren’t duplicated.' },
  { id: 'deal', title: 'Deal created', detail: 'In the Course bookings pipeline, linked to the contact.' },
  {
    id: 'coordinator',
    title: 'Coordinator alerted',
    detail: '5+ places or a price to confirm: a training coordinator gets a task to call.',
    when: (event) => event.bulk_booking || event.price_to_confirm,
  },
  { id: 'email', title: 'Confirmation email sent', detail: 'Joining instructions follow once dates are confirmed.' },
  {
    id: 'renewal',
    title: 'Renewal reminders scheduled',
    detail: 'Three months before each certificate expires.',
    when: (event) => event.renewals.length > 0,
  },
];
