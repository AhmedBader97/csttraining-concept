import { buildDemoWorkforce } from '@/content/demo-workforce';
import { certificateTypeFromLabel, expiryOf, statusOf } from '../compliance';
import { importTrainingRecords, parseCsv, parseUkDate, sampleCsv } from '../csv';

describe('certificate status', () => {
  it('expires certificates after their validity', () => {
    expect(expiryOf('2021-10-08', 5)).toBe('2026-10-08');
    expect(statusOf('2026-10-07', '2026-10-08')).toBe('expired');
    expect(statusOf('2026-12-01', '2026-10-08')).toBe('due');
    expect(statusOf('2027-06-01', '2026-10-08')).toBe('valid');
  });

  it('matches the names people use in spreadsheets', () => {
    expect(certificateTypeFromLabel('First Aid')?.id).toBe('first-aid');
    expect(certificateTypeFromLabel('cscs card')?.id).toBe('cscs');
    expect(certificateTypeFromLabel('SMSTS')?.id).toBe('smsts');
    expect(certificateTypeFromLabel('forklift')).toBeUndefined();
  });
});

describe('CSV import', () => {
  it('parses quotes, commas and line breaks', () => {
    expect(parseCsv('a,b\n"Doyle, Martin","say ""hi"""\r\n')).toEqual([
      ['a', 'b'],
      ['Doyle, Martin', 'say "hi"'],
    ]);
  });

  it('reads UK and ISO dates', () => {
    expect(parseUkDate('08/10/2024')).toBe('2024-10-08');
    expect(parseUkDate('2024-10-08')).toBe('2024-10-08');
    expect(parseUkDate('31/02/2024')).toBeNull();
  });

  it('imports good rows and explains the bad ones', () => {
    const result = importTrainingRecords(sampleCsv, '2026-10-08');
    expect(result.rowsRead).toBe(5);
    expect(result.records.map((r) => r.name)).toEqual(['Aisha Khan', 'Peter Lowe', 'Doyle, Martin']);
    expect(result.problems).toEqual([
      { line: 4, field: 'email', message: '“sam.reilly@example” isn’t an email address.' },
      { line: 5, field: 'achieved_on', message: 'Use a date like 08/10/2024 or 2024-10-08.' },
    ]);
  });

  it('asks for missing columns and spots repeats', () => {
    expect(importTrainingRecords('name,email\nA,a@b.com', '2026-10-08').problems[0]?.message).toMatch(/certificate/);
    const repeated = importTrainingRecords(
      'name,email,role,site,certificate,achieved_on\nA,a@b.com,Labourer,X,CSCS,01/01/2024\nA,a@b.com,Labourer,X,cscs,01/02/2024',
      '2026-10-08',
    );
    expect(repeated.problems[0]?.message).toBe('Same person and certificate as line 2.');
  });
});

describe('demo workforce', () => {
  it('is the same every time and uses reserved email domains', () => {
    const a = buildDemoWorkforce('2026-10-08');
    const b = buildDemoWorkforce('2026-10-08');
    expect(a).toEqual(b);
    // The one exception is the deliberately mistyped address, which has no domain ending at all.
    expect(a.employees.every((e) => e.email.endsWith('.example') || e.email.endsWith('@northfield-build'))).toBe(true);
  });
});
