import { formatGBP, priceLabel, quotePlan, splitEvenly, vatOn, withVat } from '../pricing';

describe('VAT and money', () => {
  it('adds 20% VAT', () => {
    expect(vatOn(495)).toBe(99);
    expect(withVat(495)).toBe(594);
    expect(withVat(117)).toBe(140.4);
  });

  it('formats pounds with pence only when needed', () => {
    expect(formatGBP(1100)).toBe('£1,100');
    expect(formatGBP(366.67)).toBe('£366.67');
    expect(formatGBP(140.4)).toBe('£140.40');
  });

  it('labels prices the way CST does', () => {
    expect(priceLabel({ price: 495 })).toBe('£495 + VAT');
    expect(priceLabel({ price: 115, priceFrom: true })).toBe('From £115 + VAT');
    expect(priceLabel({ price: null })).toBe('Price on request');
  });
});

describe('payment plans', () => {
  it('splits amounts into whole pence that add up exactly', () => {
    expect(splitEvenly(1100, 3)).toEqual([366.67, 366.67, 366.66]);
    expect(splitEvenly(1100, 3).reduce((a, b) => a + b, 0)).toBeCloseTo(1100, 2);
  });

  it('takes 10% off for paying in full', () => {
    const quote = quotePlan(1100, 'full');
    expect(quote.totalNet).toBe(990);
    expect(quote.totalGross).toBe(1188);
    expect(quote.savingNet).toBe(110);
    expect(quote.instalments).toHaveLength(1);
  });

  it('spreads 0% finance over 10 months with VAT on each payment', () => {
    const quote = quotePlan(1750, 'finance');
    expect(quote.instalments).toHaveLength(10);
    expect(quote.instalments[0]).toEqual({ when: 'Month 1', net: 175, gross: 210 });
    expect(quote.totalGross).toBe(2100); // matches "£2,100 inc VAT" on the management NVQ page
  });

  it('keeps the same total for 50/50 and thirds', () => {
    expect(quotePlan(895, 'half').totalNet).toBe(895);
    expect(quotePlan(1100, 'thirds').totalGross).toBe(1320);
  });
});
