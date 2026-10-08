import { formatMonth } from '@/lib/dates';

interface ForecastChartProps {
  months: Array<{ month: string; expiring: number }>;
}

/**
 * Certificates running out each month for the next year, as plain HTML bars
 * so the labels stay readable at any width. A table carries the same numbers
 * for screen readers.
 */
export function ForecastChart({ months }: ForecastChartProps) {
  const max = Math.max(1, ...months.map((m) => m.expiring));
  return (
    <figure className="forecast">
      <div className="forecast__chart" aria-hidden="true">
        {months.map((m, index) => (
          <div key={m.month} className={`forecast__col${index < 3 ? ' forecast__col--soon' : ''}`}>
            <div className="forecast__track">
              {m.expiring ? <span className="forecast__value">{m.expiring}</span> : null}
              <span className="forecast__bar" style={{ height: `${(m.expiring / max) * 100}%` }} />
            </div>
            <span className="forecast__label">{formatMonth(m.month)}</span>
          </div>
        ))}
      </div>
      <figcaption className="forecast__caption">
        Certificates expiring each month. The first three months, in orange, are inside the 90-day window.
      </figcaption>
      <table className="visually-hidden">
        <caption>Certificates expiring by month</caption>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <th scope="row">{formatMonth(m.month)}</th>
              <td>{m.expiring}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
