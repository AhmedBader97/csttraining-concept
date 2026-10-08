/** Date helpers. Dates are handled as ISO strings (YYYY-MM-DD) in UK time, never as times of day. */

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(y, m - 1, d);
  // Reject dates like 2026-02-31, which JavaScript would roll into March.
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  if (!date) throw new Error(`Not a date: ${iso}`);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Adds whole years; 29 February lands on 28 February in other years. */
export function addYears(iso: string, years: number): string {
  const date = parseISODate(iso);
  if (!date) throw new Error(`Not a date: ${iso}`);
  const month = date.getMonth();
  date.setFullYear(date.getFullYear() + years);
  if (date.getMonth() !== month) date.setDate(0);
  return toISODate(date);
}

export function addMonths(iso: string, months: number): string {
  const date = parseISODate(iso);
  if (!date) throw new Error(`Not a date: ${iso}`);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toISODate(date);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = parseISODate(fromIso);
  const to = parseISODate(toIso);
  if (!from || !to) throw new Error('Not a date');
  return Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86_400_000);
}

const longFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const shortFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' });

export function formatDate(iso: string, style: 'long' | 'short' = 'short'): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return (style === 'long' ? longFormat : shortFormat).format(date);
}

export function formatMonth(iso: string): string {
  const date = parseISODate(iso);
  return date ? monthFormat.format(date) : iso;
}

export interface ExampleDate {
  start: string;
  label: string;
  weekend: boolean;
}

/**
 * Example start dates for the booking panel. The concept has no live
 * timetable, so these follow a simple pattern: multi-day courses start on
 * Mondays, one-day courses on Tuesdays and Thursdays, plus Saturdays where
 * the course runs at weekends.
 */
export function exampleDates(todayIso: string, days: number | null, weekends: boolean, count = 6): ExampleDate[] {
  const results: ExampleDate[] = [];
  let cursor = addDays(todayIso, 7); // at least a week's notice
  const startDays = days && days > 1 ? [1] : [2, 4];
  while (results.length < count) {
    const date = parseISODate(cursor);
    if (!date) break;
    const weekday = date.getDay();
    const weekend = weekends && weekday === 6;
    if (startDays.includes(weekday) || weekend) {
      results.push({ start: cursor, label: formatDate(cursor, 'long'), weekend });
    }
    cursor = addDays(cursor, 1);
  }
  return results;
}
