# HubSpot setup for course bookings (concept)

The front end (`src/lib/integrations/hubspot.ts`) and the n8n workflow
(`integrations/n8n/booking-to-hubspot.json`) expect these in the HubSpot portal.

## Contact properties

| Property                   | Type           | Set from                         |
| -------------------------- | -------------- | -------------------------------- |
| `email` (built in)         | Text           | Checkout email, lower-cased      |
| `firstname`, `lastname`    | Text           | Checkout name                    |
| `phone` (built in)         | Phone          | Checkout phone, as +44…          |
| `company` (built in)       | Text           | Checkout company                 |
| `citb_registered_employer` | Single checkbox | "My employer is registered with CITB" |

Contacts are upserted on `email`, so a returning customer updates their record instead of creating a duplicate.

## Deal pipeline: Course bookings (`course_bookings`)

| Stage              | ID                 | Moves when                          |
| ------------------ | ------------------ | ----------------------------------- |
| Booking received   | `booking_received` | The order arrives                   |
| Dates confirmed    | `dates_confirmed`  | A coordinator confirms dates        |
| Paid               | `paid`             | WooCommerce marks the order paid    |
| Completed          | `completed`        | The certificate is issued           |

## Deal properties

| Property           | Type            | Meaning                                         |
| ------------------ | --------------- | ----------------------------------------------- |
| `amount` (built in) | Number         | Total before VAT                                |
| `places`           | Number          | Places across all courses                        |
| `courses`          | Multi-line text | e.g. `SMSTS ×2; Level 2 NVQ in Bricklaying ×1`   |
| `bulk_booking`     | Single checkbox | 5 or more places: a coordinator calls            |
| `price_to_confirm` | Single checkbox | A course without a published price is included   |
