import type { BasketState, BasketTotals } from '../basket';
import { normaliseUkPhone, type CustomerDetails } from '../validation';

/**
 * HubSpot CRM payloads for a booking: upsert the contact by email, then
 * create a deal in a "Course bookings" pipeline associated with them.
 * Pipeline and stage IDs are placeholders for the portal's own values.
 */

export const HUBSPOT_PIPELINE = 'course_bookings';
export const HUBSPOT_STAGE_BOOKED = 'booking_received';
/** HubSpot-defined association type: deal to contact. */
export const DEAL_TO_CONTACT = 3;

export interface HubSpotRequest<TBody> {
  method: 'POST';
  path: string;
  body: TBody;
}

export interface ContactUpsert {
  inputs: Array<{ idProperty: 'email'; id: string; properties: Record<string, string> }>;
}

export function contactUpsert(customer: CustomerDetails): HubSpotRequest<ContactUpsert> {
  const email = customer.email.trim().toLowerCase();
  const properties: Record<string, string> = {
    email,
    firstname: customer.firstName.trim(),
    lastname: customer.lastName.trim(),
    phone: normaliseUkPhone(customer.phone) ?? customer.phone.trim(),
    lifecyclestage: 'opportunity',
  };
  if (customer.company.trim()) properties.company = customer.company.trim();
  properties.citb_registered_employer = customer.citbRegistered ? 'true' : 'false';
  return {
    method: 'POST',
    path: '/crm/v3/objects/contacts/batch/upsert',
    body: { inputs: [{ idProperty: 'email', id: email, properties }] },
  };
}

export interface DealCreate {
  properties: Record<string, string>;
  associations: Array<{ to: { id: string }; types: Array<{ associationCategory: 'HUBSPOT_DEFINED'; associationTypeId: number }> }>;
}

export function dealName(basket: BasketState, customer: CustomerDetails): string {
  const first = basket.items[0];
  const who = customer.company.trim() || `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim();
  if (!first) return `Booking for ${who}`;
  const more = basket.items.length > 1 ? ` + ${basket.items.length - 1} more` : '';
  return `${first.name} ×${first.places}${more}: ${who}`;
}

/** The contact ID comes back from the upsert; `{{contactId}}` marks where it goes. */
export function dealCreate(basket: BasketState, customer: CustomerDetails, totals: BasketTotals, contactId = '{{contactId}}'): HubSpotRequest<DealCreate> {
  return {
    method: 'POST',
    path: '/crm/v3/objects/deals',
    body: {
      properties: {
        dealname: dealName(basket, customer),
        pipeline: HUBSPOT_PIPELINE,
        dealstage: HUBSPOT_STAGE_BOOKED,
        amount: totals.net.toFixed(2),
        places: String(totals.places),
        courses: basket.items.map((item) => `${item.name} ×${item.places}`).join('; '),
        bulk_booking: totals.bulkEligible ? 'true' : 'false',
        price_to_confirm: totals.linesOnRequest > 0 ? 'true' : 'false',
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: DEAL_TO_CONTACT }],
        },
      ],
    },
  };
}
