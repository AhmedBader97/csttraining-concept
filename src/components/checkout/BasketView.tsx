'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useBasket } from '@/components/basket/BasketProvider';
import { deliveryLabels } from '@/content/courses';
import { bulkBooking } from '@/content/funding';
import { getVenue } from '@/content/venues';
import { MAX_PLACES, type BasketState, type BasketTotals } from '@/lib/basket';
import { formatDate } from '@/lib/dates';
import { contactUpsert, dealCreate } from '@/lib/integrations/hubspot';
import { bookingEvent, type BookingEvent } from '@/lib/integrations/n8n';
import { toWooOrder } from '@/lib/integrations/woocommerce';
import { formatGBP } from '@/lib/pricing';
import { validateCustomer, type CustomerDetails, type CustomerErrors } from '@/lib/validation';
import { IntegrationInspector, type InspectorPayload } from './IntegrationInspector';

const blank: CustomerDetails = { firstName: '', lastName: '', email: '', phone: '', company: '', citbRegistered: false, notes: '' };

interface Placed {
  payloads: InspectorPayload[];
  event: BookingEvent;
  serverCheck: 'checking' | 'match' | 'mismatch' | 'offline';
}

function buildPayloads(state: BasketState, customer: CustomerDetails, totals: BasketTotals): Placed {
  const upsert = contactUpsert(customer);
  const deal = dealCreate(state, customer, totals);
  const event = bookingEvent(state, customer, totals, new Date());
  return {
    event,
    serverCheck: 'checking',
    payloads: [
      { id: 'woo', label: 'WooCommerce order', method: 'POST', endpoint: '/wp-json/wc/v3/orders', body: toWooOrder(state, customer, totals.bulkEligible) },
      { id: 'contact', label: 'HubSpot contact', method: upsert.method, endpoint: `https://api.hubapi.com${upsert.path}`, body: upsert.body },
      { id: 'deal', label: 'HubSpot deal', method: deal.method, endpoint: `https://api.hubapi.com${deal.path}`, body: deal.body },
      { id: 'n8n', label: 'n8n event', method: 'POST', endpoint: '{n8n}/webhook/cst-booking', body: event },
    ],
  };
}

export function BasketView() {
  const { state, totals, dispatch } = useBasket();
  const [customer, setCustomer] = useState<CustomerDetails>(blank);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [placed, setPlaced] = useState<Placed | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [attempts, setAttempts] = useState(0);
  const formId = useId();

  const placedRef = useRef<HTMLHeadingElement>(null);

  // After a failed submit, move focus to the list of problems once it's on screen.
  useEffect(() => {
    if (attempts > 0) summaryRef.current?.focus();
  }, [attempts]);

  // After placing, start reading from the top of the result.
  const isPlaced = placed !== null;
  useEffect(() => {
    if (isPlaced) placedRef.current?.focus();
  }, [isPlaced]);

  if (state.items.length === 0 && !placed) {
    return (
      <div className="empty-state empty-state--large">
        <h2>Your basket is empty</h2>
        <p>Find a course, an NVQ, or the route to your CSCS card.</p>
        <div className="empty-state__actions">
          <Link href="/courses" className="button button--primary">
            Browse courses
          </Link>
          <Link href="/cscs-cards" className="button button--secondary">
            Which card do I need?
          </Link>
        </div>
      </div>
    );
  }

  const update = <K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) => {
    setCustomer((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateCustomer(customer);
    setErrors(found);
    if (Object.keys(found).length) {
      setAttempts((count) => count + 1);
      return;
    }
    const result = buildPayloads(state, customer, totals);
    setPlaced(result);
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: state.items.map((item) => ({ slug: item.slug, places: item.places })) }),
      });
      const json = (await response.json()) as { totals?: BasketTotals };
      const same = response.ok && json.totals?.net === totals.net && json.totals?.gross === totals.gross;
      setPlaced({ ...result, serverCheck: same ? 'match' : 'mismatch' });
    } catch {
      setPlaced({ ...result, serverCheck: 'offline' });
    }
  };

  const errorList = Object.entries(errors).filter(([, message]) => message) as Array<[keyof CustomerDetails, string]>;

  if (placed) {
    return (
      <div className="placed">
        <div className="placed__head">
          <h2 ref={placedRef} tabIndex={-1}>
            Booking ready to send
          </h2>
          <p>
            {totals.places === 1 ? '1 place' : `${totals.places} places`}, {formatGBP(totals.gross, { pence: true })} with VAT. In this concept
            nothing has been sent or charged.
          </p>
          <div className="placed__actions">
            <button type="button" className="button button--secondary" onClick={() => setPlaced(null)}>
              Back to the basket
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => {
                dispatch({ type: 'clear' });
                setCustomer(blank);
                setPlaced(null);
              }}
            >
              Empty the basket and start again
            </button>
          </div>
        </div>
        <IntegrationInspector payloads={placed.payloads} event={placed.event} serverCheck={placed.serverCheck} />
      </div>
    );
  }

  return (
    <div className="basket">
      <section className="basket__lines" aria-labelledby="lines-title">
        <h2 id="lines-title" className="visually-hidden">
          Your basket
        </h2>
        <ul className="lines">
          {state.items.map((item) => {
            const venue = item.venue ? getVenue(item.venue) : undefined;
            const details = [
              item.kind === 'nvq' ? 'NVQ, starts when you enrol' : item.delivery ? deliveryLabels[item.delivery] : null,
              venue ? venue.name : null,
              item.date ? `starts ${formatDate(item.date, 'long')}` : null,
            ].filter(Boolean);
            return (
              <li key={item.id} className="line">
                <div className="line__main">
                  <h3 className="line__name">{item.name}</h3>
                  <p className="line__details">{details.join(', ')}</p>
                </div>
                <div className="line__places">
                  <label className="visually-hidden" htmlFor={`${formId}-${item.id}`}>
                    Places for {item.name}
                  </label>
                  <input
                    id={`${formId}-${item.id}`}
                    className="field__input line__input"
                    type="number"
                    min={1}
                    max={MAX_PLACES}
                    value={item.places}
                    onChange={(event) => dispatch({ type: 'setPlaces', id: item.id, places: Number(event.target.value) })}
                  />
                  <span className="line__unit">{item.places === 1 ? 'place' : 'places'}</span>
                </div>
                <p className="line__price">
                  {item.unitPrice == null ? 'Price on request' : `${formatGBP(item.unitPrice * item.places)} + VAT`}
                </p>
                <button type="button" className="button button--quiet line__remove" onClick={() => dispatch({ type: 'remove', id: item.id })}>
                  Remove<span className="visually-hidden"> {item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <dl className="totals">
          <div>
            <dt>Before VAT</dt>
            <dd>{formatGBP(totals.net, { pence: true })}</dd>
          </div>
          <div>
            <dt>VAT at 20%</dt>
            <dd>{formatGBP(totals.vat, { pence: true })}</dd>
          </div>
          <div className="totals__grand">
            <dt>Total</dt>
            <dd>{formatGBP(totals.gross, { pence: true })}</dd>
          </div>
        </dl>
        {totals.linesOnRequest ? (
          <p className="basket__note">
            {totals.linesOnRequest === 1 ? 'One course has' : `${totals.linesOnRequest} courses have`} no published price. A coordinator confirms
            it before you pay, and it isn’t in the total yet.
          </p>
        ) : null}
        {totals.bulkEligible ? (
          <p className="basket__note basket__note--good">
            {totals.places} places qualifies for a bulk discount ({bulkBooking.minimumPlaces} or more). A coordinator will call to confirm it.
          </p>
        ) : null}
      </section>

      <form className="checkout" onSubmit={submit} noValidate aria-labelledby="checkout-title">
        <h2 id="checkout-title" className="checkout__title">
          Your details
        </h2>
        <div ref={summaryRef} tabIndex={-1} className="error-summary" hidden={errorList.length === 0} role="alert">
          <h3>Check these details</h3>
          <ul>
            {errorList.map(([key, message]) => (
              <li key={key}>
                <a href={`#${formId}-${key}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="checkout__grid">
          {(
            [
              ['firstName', 'First name', 'text', 'given-name'],
              ['lastName', 'Last name', 'text', 'family-name'],
              ['email', 'Email', 'email', 'email'],
              ['phone', 'Phone', 'tel', 'tel'],
              ['company', 'Company (optional)', 'text', 'organization'],
            ] as const
          ).map(([key, label, type, autoComplete]) => (
            <div key={key} className={`field${errors[key] ? ' field--error' : ''}${key === 'company' ? ' field--wide' : ''}`}>
              <label className="field__label" htmlFor={`${formId}-${key}`}>
                {label}
              </label>
              {errors[key] ? (
                <p className="field__error" id={`${formId}-${key}-error`}>
                  {errors[key]}
                </p>
              ) : null}
              <input
                id={`${formId}-${key}`}
                className="field__input"
                type={type}
                autoComplete={autoComplete}
                value={customer[key]}
                aria-invalid={Boolean(errors[key]) || undefined}
                aria-describedby={errors[key] ? `${formId}-${key}-error` : undefined}
                onChange={(event) => update(key, event.target.value)}
              />
            </div>
          ))}
          <label className="checkbox field--wide">
            <input type="checkbox" checked={customer.citbRegistered} onChange={(event) => update('citbRegistered', event.target.checked)} />
            <span>My employer is registered with CITB (so may claim grants)</span>
          </label>
          <div className={`field field--wide${errors.notes ? ' field--error' : ''}`}>
            <label className="field__label" htmlFor={`${formId}-notes`}>
              Anything we should know? (optional)
            </label>
            <textarea
              id={`${formId}-notes`}
              className="field__input"
              rows={3}
              value={customer.notes}
              onChange={(event) => update('notes', event.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="button button--primary button--block">
          Place booking (concept: nothing is sent)
        </button>
        <p className="checkout__small">No payment is taken here. In the live site, a coordinator confirms dates before payment.</p>
      </form>
    </div>
  );
}
