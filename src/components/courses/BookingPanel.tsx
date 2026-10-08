'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { useBasket } from '@/components/basket/BasketProvider';
import { deliveryLabels, type Course, type Delivery } from '@/content/courses';
import { venues } from '@/content/venues';
import { MAX_PLACES } from '@/lib/basket';
import { exampleDates, toISODate, type ExampleDate } from '@/lib/dates';
import { formatGBP, withVat } from '@/lib/pricing';

type BookableCourse = Pick<Course, 'slug' | 'name' | 'price' | 'weekendPrice' | 'days' | 'delivery' | 'formats'>;

/** Choose how, where and when, then add places to the basket. */
export function BookingPanel({ course }: { course: BookableCourse }) {
  const { add } = useBasket();
  const ids = { delivery: useId(), venue: useId(), date: useId(), places: useId() };
  const [delivery, setDelivery] = useState<Delivery>(course.delivery[0] ?? 'online');
  const [venue, setVenue] = useState(venues[0]!.slug);
  const [dates, setDates] = useState<ExampleDate[]>([]);
  const [date, setDate] = useState('');
  const [places, setPlaces] = useState(1);
  const [added, setAdded] = useState(false);

  const scheduled = delivery !== 'e-learning';
  const weekends = Boolean(course.weekendPrice) || Boolean(course.formats?.some((f) => /weekend/i.test(f)));

  // Dates depend on today, so they're worked out in the browser only.
  useEffect(() => {
    const next = exampleDates(toISODate(new Date()), course.days, weekends);
    setDates(next);
    setDate((next.find((d) => !d.weekend) ?? next[0])?.start ?? '');
  }, [course.days, weekends]);

  const chosen = dates.find((d) => d.start === date);
  const unitPrice = course.price == null ? null : chosen?.weekend && course.weekendPrice ? course.weekendPrice : course.price;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    add({
      kind: 'course',
      slug: course.slug,
      name: course.name,
      unitPrice,
      places,
      delivery,
      venue: delivery === 'classroom' ? venue : undefined,
      date: scheduled ? date || undefined : undefined,
    });
    setAdded(true);
  };

  return (
    <form className="booking" onSubmit={submit} aria-label={`Book ${course.name}`}>
      <h2 className="booking__title">Book places</h2>

      {course.delivery.length > 1 ? (
        <fieldset className="booking__field">
          <legend className="field__label">How</legend>
          <div className="segmented">
            {course.delivery.map((mode) => (
              <label key={mode} className="segmented__option">
                <input type="radio" name={ids.delivery} value={mode} checked={delivery === mode} onChange={() => setDelivery(mode)} />
                <span>{deliveryLabels[mode]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="booking__fixed">{deliveryLabels[delivery]}</p>
      )}

      {delivery === 'classroom' ? (
        <div className="field booking__field">
          <label className="field__label" htmlFor={ids.venue}>
            Venue
          </label>
          <select id={ids.venue} className="field__input" value={venue} onChange={(event) => setVenue(event.target.value)}>
            {venues.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.name}, {v.postcode}
              </option>
            ))}
          </select>
          <p className="field__hint">Plus 30+ other locations. A coordinator can suggest the nearest.</p>
        </div>
      ) : null}

      {scheduled ? (
        <div className="field booking__field">
          <label className="field__label" htmlFor={ids.date}>
            Start date
          </label>
          <select id={ids.date} className="field__input" value={date} onChange={(event) => setDate(event.target.value)} disabled={!dates.length}>
            {dates.map((d) => (
              <option key={d.start} value={d.start}>
                {d.label}
                {d.weekend ? ' (weekend)' : ''}
              </option>
            ))}
          </select>
          <p className="field__hint">Example dates for this concept. The real timetable would come from the booking system.</p>
        </div>
      ) : (
        <p className="booking__fixed">Start as soon as you’ve booked.</p>
      )}

      <div className="field booking__field">
        <label className="field__label" htmlFor={ids.places}>
          Places
        </label>
        <div className="stepper">
          <button type="button" className="stepper__button" aria-label="One fewer place" onClick={() => setPlaces((p) => Math.max(1, p - 1))} disabled={places <= 1}>
            −
          </button>
          <input
            id={ids.places}
            className="stepper__input"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_PLACES}
            value={places}
            onChange={(event) => setPlaces(Math.min(MAX_PLACES, Math.max(1, Number(event.target.value) || 1)))}
          />
          <button type="button" className="stepper__button" aria-label="One more place" onClick={() => setPlaces((p) => Math.min(MAX_PLACES, p + 1))} disabled={places >= MAX_PLACES}>
            +
          </button>
        </div>
        {places >= 5 ? <p className="field__hint field__hint--good">5 or more places qualifies for a bulk discount. A coordinator will confirm it.</p> : null}
      </div>

      <div className="booking__total">
        {unitPrice == null ? (
          <p>A coordinator confirms the price for these dates.</p>
        ) : (
          <>
            <p className="booking__sum">
              {formatGBP(unitPrice * places)} <span>+ VAT</span>
            </p>
            <p className="booking__vat">{formatGBP(withVat(unitPrice * places))} with VAT</p>
          </>
        )}
      </div>

      <button type="submit" className="button button--primary button--block">
        Add to basket
      </button>
      <p className="booking__added" role="status">
        {added ? (
          <>
            Added. <Link href="/basket">Go to your basket</Link>
          </>
        ) : null}
      </p>
    </form>
  );
}
