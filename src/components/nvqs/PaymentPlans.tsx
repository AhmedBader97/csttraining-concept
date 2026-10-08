'use client';

import { useId, useState } from 'react';
import { paymentPlans, type PaymentPlanId } from '@/content/funding';
import { formatGBP, quotePlan } from '@/lib/pricing';

/** The four ways to pay for an NVQ, worked out for this price. */
export function PaymentPlans({ price }: { price: number }) {
  const [plan, setPlan] = useState<PaymentPlanId>('full');
  const name = useId();
  const quote = quotePlan(price, plan);
  const first = quote.instalments[0];
  const sameEveryTime = quote.instalments.every((step) => Math.abs(step.gross - (first?.gross ?? 0)) < 0.02);

  return (
    <section className="plans" aria-labelledby={`${name}-title`}>
      <h2 id={`${name}-title`} className="plans__title">
        Ways to pay
      </h2>
      <div className="plans__options" role="radiogroup" aria-labelledby={`${name}-title`}>
        {paymentPlans.map((option) => (
          <label key={option.id} className="plan-option">
            <input type="radio" name={name} value={option.id} checked={plan === option.id} onChange={() => setPlan(option.id)} />
            <span className="plan-option__label">{option.label}</span>
            <span className="plan-option__description">{option.description}</span>
          </label>
        ))}
      </div>

      <div className="plans__schedule" aria-live="polite">
        {plan === 'finance' && first ? (
          <p className="plans__headline">
            {formatGBP(first.gross)} a month for 10 months, with VAT
            {sameEveryTime ? '' : ' (the last payment differs by a penny)'}
          </p>
        ) : (
          <table className="plans__table">
            <caption className="visually-hidden">Payments for this plan</caption>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Before VAT</th>
                <th scope="col">With VAT</th>
              </tr>
            </thead>
            <tbody>
              {quote.instalments.map((step) => (
                <tr key={step.when}>
                  <th scope="row">{step.when}</th>
                  <td>{formatGBP(step.net, { pence: !Number.isInteger(step.net) })}</td>
                  <td>{formatGBP(step.gross, { pence: !Number.isInteger(step.gross) })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="plans__total">
          Total {formatGBP(quote.totalGross, { pence: !Number.isInteger(quote.totalGross) })} with VAT
          {quote.savingNet > 0 ? `, saving ${formatGBP(quote.savingNet)} before VAT` : ''}.
        </p>
      </div>
    </section>
  );
}
