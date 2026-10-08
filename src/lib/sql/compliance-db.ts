import type { Database, SqlJsStatic, SqlValue } from 'sql.js';
import type { DemoWorkforce } from '@/content/demo-workforce';
import { certificateTypes } from '../compliance';

/**
 * The Compliance Control concept keeps its records in a real SQLite database
 * (sql.js, running in the browser). Every widget on the dashboard is one of
 * the queries below, and the page shows the SQL behind it.
 */

export const SCHEMA = `
CREATE TABLE certificate_types (
  id             TEXT PRIMARY KEY,
  label          TEXT NOT NULL,
  validity_years INTEGER NOT NULL,
  renew_with     TEXT
);

CREATE TABLE employees (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT,
  role  TEXT NOT NULL,
  site  TEXT NOT NULL
);

CREATE TABLE certificates (
  id          INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  type_id     TEXT NOT NULL REFERENCES certificate_types(id),
  achieved_on TEXT NOT NULL
);

CREATE INDEX certificates_employee ON certificates(employee_id);
`;

/** Every certificate with its expiry date and status as of :today. */
const STATUS_CTE = `status AS (
  SELECT c.id, c.employee_id, e.name, e.site, e.role,
         t.label AS certificate, t.renew_with,
         date(c.achieved_on, '+' || t.validity_years || ' years') AS expires_on,
         CASE
           WHEN date(c.achieved_on, '+' || t.validity_years || ' years') < :today THEN 'expired'
           WHEN date(c.achieved_on, '+' || t.validity_years || ' years') <= date(:today, '+90 days') THEN 'due'
           ELSE 'valid'
         END AS status
  FROM certificates c
  JOIN employees e ON e.id = c.employee_id
  JOIN certificate_types t ON t.id = c.type_id
)`;

export const QUERIES = {
  summary: `WITH ${STATUS_CTE}
SELECT
  (SELECT COUNT(*) FROM employees) AS employees,
  (SELECT COUNT(*) FROM employees
    WHERE id NOT IN (SELECT employee_id FROM status WHERE status = 'expired')) AS compliant,
  COALESCE(SUM(status = 'expired'), 0) AS expired,
  COALESCE(SUM(status = 'due'), 0) AS due,
  COUNT(*) AS certificates
FROM status;`,

  bySite: `WITH ${STATUS_CTE}
SELECT site,
       COUNT(DISTINCT employee_id) AS people,
       SUM(status = 'expired') AS expired,
       SUM(status = 'due') AS due,
       SUM(status = 'valid') AS valid
FROM status
GROUP BY site
ORDER BY expired DESC, due DESC, site;`,

  forecast: `WITH RECURSIVE months(month) AS (
  SELECT date(:today, 'start of month')
  UNION ALL
  SELECT date(month, '+1 month') FROM months
  WHERE month < date(:today, 'start of month', '+11 months')
), ${STATUS_CTE}
SELECT month, COUNT(status.id) AS expiring
FROM months
LEFT JOIN status ON date(status.expires_on, 'start of month') = month
GROUP BY month
ORDER BY month;`,

  actions: `WITH ${STATUS_CTE}
SELECT id, name, site, certificate, expires_on, status, renew_with
FROM status
WHERE status <> 'valid'
ORDER BY expires_on
LIMIT 50;`,

  duplicatePeople: `SELECT lower(email) AS email, COUNT(*) AS records, group_concat(name, ' / ') AS names
FROM employees
WHERE email IS NOT NULL AND email <> ''
GROUP BY lower(email)
HAVING COUNT(*) > 1;`,

  badEmails: `SELECT name, email
FROM employees
WHERE email IS NULL OR email = ''
   OR email NOT LIKE '%_@_%._%'
   OR email LIKE '% %';`,

  missingCscs: `SELECT e.name, e.role, e.site
FROM employees e
WHERE NOT EXISTS (
  SELECT 1 FROM certificates c
  WHERE c.employee_id = e.id AND c.type_id = 'cscs'
);`,
} as const;

export type QueryName = keyof typeof QUERIES;

export type Row = Record<string, SqlValue>;

export function createComplianceDb(SQL: SqlJsStatic, data: DemoWorkforce): Database {
  const db = new SQL.Database();
  db.run(SCHEMA);
  const insertType = db.prepare('INSERT INTO certificate_types VALUES (?, ?, ?, ?)');
  for (const type of certificateTypes) insertType.run([type.id, type.label, type.validityYears, type.renewWith]);
  insertType.free();
  const insertEmployee = db.prepare('INSERT INTO employees VALUES (?, ?, ?, ?, ?)');
  for (const e of data.employees) insertEmployee.run([e.id, e.name, e.email, e.role, e.site]);
  insertEmployee.free();
  const insertCertificate = db.prepare('INSERT INTO certificates VALUES (?, ?, ?, ?)');
  for (const c of data.certificates) insertCertificate.run([c.id, c.employeeId, c.typeId, c.achievedOn]);
  insertCertificate.free();
  return db;
}

/** Runs one of the named queries (or any SQL) and returns plain objects. */
export function query(db: Database, sql: string, today: string): Row[] {
  const statement = db.prepare(sql);
  try {
    if (sql.includes(':today')) statement.bind({ ':today': today });
    const rows: Row[] = [];
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally {
    statement.free();
  }
}

/** Adds imported records, creating people who aren't on file yet (matched by email). */
export function addRecords(
  db: Database,
  records: Array<{ name: string; email: string; role: string; site: string; certificate: string; achievedOn: string }>,
): number {
  let added = 0;
  for (const record of records) {
    const existing = db.exec('SELECT id FROM employees WHERE lower(email) = lower($email) LIMIT 1', { $email: record.email });
    let employeeId = existing[0]?.values[0]?.[0] as number | undefined;
    if (employeeId == null) {
      db.run('INSERT INTO employees (name, email, role, site) VALUES (?, ?, ?, ?)', [record.name, record.email, record.role, record.site]);
      employeeId = db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] as number;
    }
    db.run('INSERT INTO certificates (employee_id, type_id, achieved_on) VALUES (?, ?, ?)', [employeeId, record.certificate, record.achievedOn]);
    added += 1;
  }
  return added;
}
