import { addMonths, addYears, daysBetween, exampleDates, parseISODate } from '../dates';

describe('dates', () => {
  it('rejects impossible dates', () => {
    expect(parseISODate('2026-02-31')).toBeNull();
    expect(parseISODate('2028-02-29')).not.toBeNull();
  });

  it('adds years and months without spilling into the next month', () => {
    expect(addYears('2026-10-08', 5)).toBe('2031-10-08');
    expect(addYears('2028-02-29', 1)).toBe('2029-02-28');
    expect(addMonths('2031-05-31', -3)).toBe('2031-02-28');
  });

  it('counts days across clock changes', () => {
    expect(daysBetween('2026-10-20', '2026-10-30')).toBe(10);
  });

  it('suggests Monday starts for multi-day courses, at least a week ahead', () => {
    const dates = exampleDates('2026-10-08', 5, false, 3);
    expect(dates.map((d) => d.start)).toEqual(['2026-10-19', '2026-10-26', '2026-11-02']);
  });

  it('adds Saturdays for courses that run at weekends', () => {
    const dates = exampleDates('2026-10-08', 1, true, 4);
    expect(dates.some((d) => d.weekend)).toBe(true);
    expect(dates[0]?.start).toBe('2026-10-15');
  });
});
