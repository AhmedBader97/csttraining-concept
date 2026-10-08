/**
 * @jest-environment node
 */
import path from 'node:path';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { buildDemoWorkforce } from '@/content/demo-workforce';
import { addRecords, createComplianceDb, query, QUERIES } from '../compliance-db';

const today = '2026-10-08';
let SQL: SqlJsStatic;

beforeAll(async () => {
  SQL = await initSqlJs({ locateFile: (file) => path.join(process.cwd(), 'node_modules/sql.js/dist', file) });
});

function db() {
  return createComplianceDb(SQL, buildDemoWorkforce(today));
}

describe('compliance database', () => {
  it('summarises the workforce', () => {
    const [summary] = query(db(), QUERIES.summary, today);
    expect(summary).toMatchObject({ employees: 25 });
    expect(Number(summary!.expired)).toBeGreaterThan(0);
    expect(Number(summary!.due)).toBeGreaterThan(0);
    expect(Number(summary!.compliant)).toBeLessThan(25);
  });

  it('agrees with JavaScript on what has expired', () => {
    const rows = query(db(), QUERIES.actions, today);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.status === 'expired' ? String(row.expires_on) < today : String(row.expires_on) >= today).toBe(true);
    }
  });

  it('forecasts expiries for the next 12 months', () => {
    const rows = query(db(), QUERIES.forecast, today);
    expect(rows).toHaveLength(12);
    expect(rows[0]?.month).toBe('2026-10-01');
    expect(rows[11]?.month).toBe('2027-09-01');
  });

  it('finds the deliberate data problems', () => {
    const database = db();
    expect(query(database, QUERIES.duplicatePeople, today)).toEqual([
      { email: 'tom.barker@northfield-build.example', records: 2, names: 'Tom Barker / Tom barker' },
    ]);
    expect(query(database, QUERIES.badEmails, today).map((r) => r.name)).toEqual(['Ryan Fletcher']);
    expect(query(database, QUERIES.missingCscs, today).map((r) => r.name)).toEqual(['Ben Ashworth', 'Tom barker']);
  });

  it('adds imported records, matching people by email', () => {
    const database = db();
    const added = addRecords(database, [
      { name: 'Aisha Khan', email: 'aisha.khan@example.com', role: 'Site supervisor', site: 'School Extension', certificate: 'sssts', achievedOn: '2022-03-14' },
      { name: 'Ben Ashworth', email: 'ben.ashworth@northfield-build.example', role: 'Plant operator', site: 'Retail Park Units', certificate: 'cscs', achievedOn: '2024-01-10' },
    ]);
    expect(added).toBe(2);
    expect(query(database, QUERIES.summary, today)[0]).toMatchObject({ employees: 26 });
    // Aisha came in with only an SSSTS, so she's now missing a CSCS card; Ben's card was added.
    expect(query(database, QUERIES.missingCscs, today).map((r) => r.name)).toEqual(['Tom barker', 'Aisha Khan']);
  });
});
