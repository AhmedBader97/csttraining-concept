import { certificateTypeFromLabel, type CertificateTypeId } from './compliance';
import { parseISODate, toISODate } from './dates';
import { isEmail } from './validation';

/**
 * Importing training records from a spreadsheet. Every row is checked before
 * anything is saved, and each problem says which line and what to fix.
 */

export const CSV_HEADERS = ['name', 'email', 'role', 'site', 'certificate', 'achieved_on'] as const;

export interface ImportedRecord {
  line: number;
  name: string;
  email: string;
  role: string;
  site: string;
  certificate: CertificateTypeId;
  achievedOn: string;
}

export interface ImportProblem {
  line: number;
  field: string;
  message: string;
}

export interface ImportResult {
  records: ImportedRecord[];
  problems: ImportProblem[];
  rowsRead: number;
}

/** RFC 4180-style parsing: quoted fields, doubled quotes, commas and line breaks inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const input = text.replace(/^﻿/, '');
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** Accepts 2026-10-08 or the UK-style 08/10/2026. */
export function parseUkDate(value: string): string | null {
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return parseISODate(text) ? text : null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, d, m, y] = match;
  const iso = `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
  const date = parseISODate(iso);
  return date ? toISODate(date) : null;
}

export function importTrainingRecords(text: string, today: string): ImportResult {
  const rows = parseCsv(text);
  const problems: ImportProblem[] = [];
  const records: ImportedRecord[] = [];
  const [header, ...body] = rows;
  if (!header) return { records, problems: [{ line: 1, field: 'file', message: 'The file is empty.' }], rowsRead: 0 };

  const columns = header.map((cell) => cell.trim().toLowerCase().replace(/\s+/g, '_'));
  const missing = CSV_HEADERS.filter((name) => !columns.includes(name));
  if (missing.length) {
    return {
      records,
      problems: [{ line: 1, field: 'header', message: `Add these columns to the first row: ${missing.join(', ')}.` }],
      rowsRead: body.length,
    };
  }
  const index = Object.fromEntries(CSV_HEADERS.map((name) => [name, columns.indexOf(name)])) as Record<(typeof CSV_HEADERS)[number], number>;
  const seen = new Map<string, number>();

  body.forEach((cells, offset) => {
    const line = offset + 2;
    const cell = (name: (typeof CSV_HEADERS)[number]) => (cells[index[name]] ?? '').trim();
    const rowProblems: ImportProblem[] = [];
    const name = cell('name');
    const email = cell('email').toLowerCase();
    const certificateLabel = cell('certificate');
    const certificate = certificateTypeFromLabel(certificateLabel);
    const achievedOn = parseUkDate(cell('achieved_on'));

    if (!name) rowProblems.push({ line, field: 'name', message: 'Add the person’s name.' });
    if (!isEmail(email)) rowProblems.push({ line, field: 'email', message: `“${cell('email') || 'blank'}” isn’t an email address.` });
    if (!cell('site')) rowProblems.push({ line, field: 'site', message: 'Add the site they work on.' });
    if (!certificate) {
      rowProblems.push({
        line,
        field: 'certificate',
        message: `“${certificateLabel || 'blank'}” isn’t a certificate we track. Use CSCS, SMSTS, SSSTS, HSA or First Aid.`,
      });
    }
    if (!achievedOn) rowProblems.push({ line, field: 'achieved_on', message: 'Use a date like 08/10/2024 or 2024-10-08.' });
    else if (achievedOn > today) rowProblems.push({ line, field: 'achieved_on', message: 'This date is in the future.' });

    if (certificate && email) {
      const key = `${email}|${certificate.id}`;
      const firstLine = seen.get(key);
      if (firstLine) rowProblems.push({ line, field: 'certificate', message: `Same person and certificate as line ${firstLine}.` });
      else seen.set(key, line);
    }

    if (rowProblems.length) problems.push(...rowProblems);
    else if (certificate && achievedOn) {
      records.push({ line, name, email, role: cell('role') || 'Not given', site: cell('site'), certificate: certificate.id, achievedOn });
    }
  });

  return { records, problems, rowsRead: body.length };
}

/** A sample file with two mistakes in it, for trying the import. */
export const sampleCsv = [
  CSV_HEADERS.join(','),
  'Aisha Khan,aisha.khan@example.com,Site supervisor,School Extension,SSSTS,14/03/2022',
  'Peter Lowe,peter.lowe@example.com,Site manager,Head Office,SMSTS,2021-11-02',
  'Sam Reilly,sam.reilly@example,Labourer,Riverside Apartments,CSCS,05/06/2023',
  'Chloe Grant,chloe.grant@example.com,Carpenter,Retail Park Units,First Aid,31/02/2024',
  '"Doyle, Martin",martin.doyle@example.com,Groundworker,Retail Park Units,CSCS,19/09/2022',
].join('\n');
