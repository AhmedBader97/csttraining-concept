'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import type { Database } from 'sql.js';
import { useBasket } from '@/components/basket/BasketProvider';
import { getCourse } from '@/content/courses';
import { buildDemoWorkforce, demoCompany } from '@/content/demo-workforce';
import { statusLabels, type ComplianceStatus } from '@/lib/compliance';
import { importTrainingRecords, sampleCsv, type ImportResult } from '@/lib/csv';
import { formatDate, toISODate } from '@/lib/dates';
import { addRecords, createComplianceDb, query, QUERIES, type Row } from '@/lib/sql/compliance-db';
import { ForecastChart } from './ForecastChart';
import { ShowSql } from './ShowSql';

const num = (value: unknown) => Number(value ?? 0);

/**
 * A working concept of CST's Compliance Control: a made-up company's training
 * records in a real SQLite database (sql.js, in the browser). Nothing leaves the page.
 */
export function ComplianceDashboard() {
  const { add } = useBasket();
  const [db, setDb] = useState<Database | null>(null);
  const [failed, setFailed] = useState(false);
  const [today] = useState(() => toISODate(new Date()));
  const [version, setVersion] = useState(0);
  const [booked, setBooked] = useState<number[]>([]);
  const [imported, setImported] = useState<ImportResult | null>(null);
  const fileId = useId();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const initSqlJs = (await import('sql.js')).default;
        const SQL = await initSqlJs({ locateFile: (file: string) => `/${file}` });
        if (!cancelled) setDb(createComplianceDb(SQL, buildDemoWorkforce(today)));
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today]);

  const data = useMemo(() => {
    if (!db) return null;
    void version; // re-run every query after an import
    const run = (sql: string) => query(db, sql, today);
    return {
      summary: run(QUERIES.summary)[0] ?? {},
      bySite: run(QUERIES.bySite),
      forecast: run(QUERIES.forecast).map((row) => ({ month: String(row.month), expiring: num(row.expiring) })),
      actions: run(QUERIES.actions),
      duplicates: run(QUERIES.duplicatePeople),
      badEmails: run(QUERIES.badEmails),
      missingCscs: run(QUERIES.missingCscs),
    };
  }, [db, today, version]);

  const importText = useCallback(
    (text: string) => {
      if (!db) return;
      const result = importTrainingRecords(text, today);
      if (result.records.length) {
        addRecords(
          db,
          result.records.map((r) => ({ name: r.name, email: r.email, role: r.role, site: r.site, certificate: r.certificate, achievedOn: r.achievedOn })),
        );
        setVersion((v) => v + 1);
      }
      setImported(result);
    },
    [db, today],
  );

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      setImported({ records: [], rowsRead: 0, problems: [{ line: 0, field: 'file', message: 'Choose a file under 1 MB.' }] });
      return;
    }
    importText(await file.text());
    event.target.value = '';
  };

  const book = (row: Row) => {
    const course = getCourse(String(row.renew_with));
    if (!course) return;
    add({ kind: 'course', slug: course.slug, name: course.name, unitPrice: course.price, delivery: course.delivery[0] });
    setBooked((ids) => [...ids, num(row.id)]);
  };

  if (failed) {
    return (
      <p className="dashboard__message">
        The dashboard needs WebAssembly, which this browser has turned off. Try another browser to see it working.
      </p>
    );
  }
  if (!data) return <p className="dashboard__message">Opening the records…</p>;

  const { summary } = data;
  const employees = num(summary.employees);
  const compliant = num(summary.compliant);
  const percent = employees ? Math.round((compliant / employees) * 100) : 100;
  const problems = data.duplicates.length + data.badEmails.length + data.missingCscs.length;

  return (
    <div className="dashboard">
      <p className="dashboard__company">
        <strong>{demoCompany}</strong> is made up, and so is everyone in it. Dates are worked out from today, {formatDate(today, 'long')}.
      </p>

      <section className="board" aria-label="Summary">
        <div className="board__item board__item--lead">
          <p className="board__value">{percent}%</p>
          <p className="board__label">
            of people fully in date ({compliant} of {employees})
          </p>
          <div className="board__meter" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="board__item board__item--expired">
          <p className="board__value">{num(summary.expired)}</p>
          <p className="board__label">certificates expired</p>
        </div>
        <div className="board__item board__item--due">
          <p className="board__value">{num(summary.due)}</p>
          <p className="board__label">due in the next 90 days</p>
        </div>
        <div className="board__item">
          <p className="board__value">{num(summary.certificates)}</p>
          <p className="board__label">certificates tracked</p>
        </div>
      </section>
      <ShowSql sql={QUERIES.summary} />

      <section className="panel" aria-labelledby="actions-title">
        <div className="panel__head">
          <h2 id="actions-title">Needs booking</h2>
          <p>Expired first. Booking adds the renewal course to the basket.</p>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Person</th>
                <th scope="col">Site</th>
                <th scope="col">Certificate</th>
                <th scope="col">Expires</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="visually-hidden">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.actions.map((row) => {
                const status = String(row.status) as ComplianceStatus;
                const course = row.renew_with ? getCourse(String(row.renew_with)) : undefined;
                const done = booked.includes(num(row.id));
                return (
                  <tr key={num(row.id)}>
                    <th scope="row">{String(row.name)}</th>
                    <td data-label="Site">{String(row.site)}</td>
                    <td data-label="Certificate">{String(row.certificate)}</td>
                    <td data-label="Expires">{formatDate(String(row.expires_on))}</td>
                    <td className="data-table__status">
                      <span className={`status status--${status}`}>{statusLabels[status]}</span>
                    </td>
                    <td>
                      {course ? (
                        <button type="button" className="button button--small button--secondary" onClick={() => book(row)} disabled={done}>
                          {done ? 'In basket' : `Book ${course.name}`}
                        </button>
                      ) : (
                        <span className="data-table__note">Renew through CSCS</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {booked.length ? (
          <p className="panel__foot" role="status">
            {booked.length === 1 ? '1 renewal' : `${booked.length} renewals`} in your basket. <Link href="/basket">Book them</Link>
          </p>
        ) : null}
        <ShowSql sql={QUERIES.actions} />
      </section>

      <div className="dashboard__pair">
        <section className="panel" aria-labelledby="forecast-title">
          <div className="panel__head">
            <h2 id="forecast-title">Coming up</h2>
          </div>
          <ForecastChart months={data.forecast} />
          <ShowSql sql={QUERIES.forecast} />
        </section>

        <section className="panel" aria-labelledby="sites-title">
          <div className="panel__head">
            <h2 id="sites-title">By site</h2>
          </div>
          <ul className="site-bars">
            {data.bySite.map((row) => {
              const expired = num(row.expired);
              const due = num(row.due);
              const valid = num(row.valid);
              const total = Math.max(1, expired + due + valid);
              return (
                <li key={String(row.site)} className="site-bars__row">
                  <p className="site-bars__name">
                    {String(row.site)} <span>{num(row.people)} people</span>
                  </p>
                  <div className="site-bars__bar" aria-hidden="true">
                    <span className="site-bars__seg site-bars__seg--expired" style={{ width: `${(expired / total) * 100}%` }} />
                    <span className="site-bars__seg site-bars__seg--due" style={{ width: `${(due / total) * 100}%` }} />
                    <span className="site-bars__seg site-bars__seg--valid" style={{ width: `${(valid / total) * 100}%` }} />
                  </div>
                  <p className="site-bars__counts">
                    {expired} expired, {due} due, {valid} in date
                  </p>
                </li>
              );
            })}
          </ul>
          <ShowSql sql={QUERIES.bySite} />
        </section>
      </div>

      <section className="panel" aria-labelledby="checks-title">
        <div className="panel__head">
          <h2 id="checks-title">Data checks</h2>
          <p>{problems ? `${problems} records to tidy up before the next audit.` : 'Nothing to tidy up.'}</p>
        </div>
        <div className="checks">
          <article className="check">
            <h3 className="check__title">Same person twice</h3>
            {data.duplicates.length ? (
              <ul>
                {data.duplicates.map((row) => (
                  <li key={String(row.email)}>
                    {String(row.names)} share {String(row.email)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>None found.</p>
            )}
            <ShowSql sql={QUERIES.duplicatePeople} />
          </article>
          <article className="check">
            <h3 className="check__title">Emails that won’t deliver</h3>
            {data.badEmails.length ? (
              <ul>
                {data.badEmails.map((row) => (
                  <li key={String(row.name)}>
                    {String(row.name)}: {String(row.email || 'blank')}
                  </li>
                ))}
              </ul>
            ) : (
              <p>None found.</p>
            )}
            <ShowSql sql={QUERIES.badEmails} />
          </article>
          <article className="check">
            <h3 className="check__title">No CSCS card on file</h3>
            {data.missingCscs.length ? (
              <ul>
                {data.missingCscs.map((row) => (
                  <li key={String(row.name)}>
                    {String(row.name)}, {String(row.role)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Everyone has one.</p>
            )}
            <ShowSql sql={QUERIES.missingCscs} />
          </article>
        </div>
      </section>

      <section className="panel" aria-labelledby="import-title">
        <div className="panel__head">
          <h2 id="import-title">Import training records</h2>
          <p>
            Upload a CSV with the columns <code>name, email, role, site, certificate, achieved_on</code>. Every row is checked before anything
            is added, and the file stays on your device.
          </p>
        </div>
        <div className="import">
          <label htmlFor={fileId} className="button button--secondary">
            Choose a CSV file
          </label>
          <input id={fileId} className="visually-hidden" type="file" accept=".csv,text/csv" onChange={onFile} />
          <button type="button" className="button button--quiet" onClick={() => importText(sampleCsv)}>
            Try the sample file (it has two mistakes)
          </button>
          <a className="import__download" href={`data:text/csv;charset=utf-8,${encodeURIComponent(sampleCsv)}`} download="training-records-sample.csv">
            Download the sample
          </a>
        </div>
        {imported ? (
          <div className="import__result" role="status">
            <p>
              Read {imported.rowsRead} {imported.rowsRead === 1 ? 'row' : 'rows'}. Added {imported.records.length}.
              {imported.problems.length ? ` ${imported.problems.length} to fix:` : ' No problems.'}
            </p>
            {imported.problems.length ? (
              <ul className="import__problems">
                {imported.problems.map((problem, index) => (
                  <li key={`${problem.line}-${problem.field}-${index}`}>
                    {problem.line ? `Line ${problem.line}, ${problem.field}: ` : ''}
                    {problem.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
