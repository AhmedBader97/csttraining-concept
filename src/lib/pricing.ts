import type { PaymentPlanId } from '@/content/funding';

/** UK VAT, charged at 20% on every course. */
export const VAT_RATE = 0.2;

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function vatOn(net: number): number {
  return round2(net * VAT_RATE);
}

export function withVat(net: number): number {
  return round2(net + vatOn(net));
}

const whole = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const pence = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** £495, or £366.67 when there are pence. */
export function formatGBP(amount: number, options: { pence?: boolean } = {}): string {
  const showPence = options.pence ?? !Number.isInteger(round2(amount));
  return (showPence ? pence : whole).format(round2(amount));
}

export interface Priced {
  price: number | null;
  priceFrom?: boolean;
}

/** "£495 + VAT", "From £115 + VAT" or "Price on request". */
export function priceLabel(item: Priced): string {
  if (item.price == null) return 'Price on request';
  return `${item.priceFrom ? 'From ' : ''}${formatGBP(item.price)} + VAT`;
}

export interface Instalment {
  when: string;
  net: number;
  gross: number;
}

export interface PlanQuote {
  plan: PaymentPlanId;
  instalments: Instalment[];
  totalNet: number;
  totalGross: number;
  /** Saving against the full price, before VAT. */
  savingNet: number;
}

/** Split an amount into `parts` payments of whole pence that add up exactly. */
export function splitEvenly(amount: number, parts: number): number[] {
  const totalPence = Math.round(amount * 100);
  const base = Math.floor(totalPence / parts);
  const remainder = totalPence - base * parts;
  // Spread the odd pence over the first payments so no payment is out by more than 1p.
  return Array.from({ length: parts }, (_, index) => (base + (index < remainder ? 1 : 0)) / 100);
}

/**
 * The payment plans on CST Training's NVQ pages, applied to a price before VAT.
 * VAT is added to each payment.
 */
export function quotePlan(netPrice: number, plan: PaymentPlanId): PlanQuote {
  const schedule: Array<{ when: string; net: number }> = [];
  let totalNet = netPrice;

  if (plan === 'full') {
    totalNet = round2(netPrice * 0.9);
    schedule.push({ when: 'Today', net: totalNet });
  } else if (plan === 'half') {
    const [first = 0, second = 0] = splitEvenly(netPrice, 2);
    schedule.push({ when: 'At the start', net: first }, { when: 'On completion or after 6 months', net: second });
  } else if (plan === 'thirds') {
    const [a = 0, b = 0, c = 0] = splitEvenly(netPrice, 3);
    schedule.push(
      { when: 'At the start', net: a },
      { when: 'After 1 month', net: b },
      { when: 'On completion or after 6 months', net: c },
    );
  } else {
    splitEvenly(netPrice, 10).forEach((net, index) => schedule.push({ when: `Month ${index + 1}`, net }));
  }

  // VAT is worked out on the total, then split the same way, so the payments always add up to it.
  const grossParts = splitEvenly(withVat(totalNet), schedule.length);
  const instalments = schedule.map((step, index) => ({ ...step, gross: grossParts[index] ?? 0 }));
  return {
    plan,
    instalments,
    totalNet: round2(instalments.reduce((sum, step) => sum + step.net, 0)),
    totalGross: round2(instalments.reduce((sum, step) => sum + step.gross, 0)),
    savingNet: round2(netPrice - totalNet),
  };
}
