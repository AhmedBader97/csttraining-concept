import type { CertificateTypeId } from '@/lib/compliance';
import { getCertificateType } from '@/lib/compliance';
import { addDays } from '@/lib/dates';

/**
 * A made-up company for the Compliance Control concept. Every name and
 * address is invented (emails use the reserved .example domain). Dates are
 * set relative to today, so the dashboard always has something to act on.
 *
 * Three records are wrong on purpose, for the data checks to find: a
 * duplicate person, a mistyped email and someone with no CSCS card.
 */

export interface DemoEmployee {
  id: number;
  name: string;
  email: string;
  role: string;
  site: string;
}

export interface DemoCertificate {
  id: number;
  employeeId: number;
  typeId: CertificateTypeId;
  achievedOn: string;
}

export const demoCompany = 'Northfield Build Ltd';

const sites = ['Riverside Apartments', 'School Extension', 'Retail Park Units', 'Head Office'] as const;

const people: Array<[string, string, (typeof sites)[number]]> = [
  ['Daniel Okafor', 'Site manager', 'Riverside Apartments'],
  ['Sarah Whitfield', 'Project manager', 'Head Office'],
  ['Marek Nowak', 'Site supervisor', 'Riverside Apartments'],
  ['Priya Sharma', 'Site supervisor', 'School Extension'],
  ['Liam Doherty', 'Bricklayer', 'Riverside Apartments'],
  ['Tom Barker', 'Bricklayer', 'Riverside Apartments'],
  ['Kwame Mensah', 'Carpenter', 'School Extension'],
  ['Jake Holloway', 'Carpenter', 'Retail Park Units'],
  ['Andrei Popescu', 'Groundworker', 'Retail Park Units'],
  ['Connor Walsh', 'Groundworker', 'Riverside Apartments'],
  ['Hannah Price', 'Electrician', 'School Extension'],
  ['Mohammed Rahman', 'Electrician', 'Retail Park Units'],
  ['Ryan Fletcher', 'Plasterer', 'School Extension'],
  ['Ewan Campbell', 'Scaffolder', 'Riverside Apartments'],
  ['Luke Simmons', 'Labourer', 'Riverside Apartments'],
  ['Dominik Kowalski', 'Labourer', 'Retail Park Units'],
  ['Josh Turner', 'Labourer', 'School Extension'],
  ['Femi Adeyemi', 'Labourer', 'Retail Park Units'],
  ['Grace Liddell', 'Site manager', 'Retail Park Units'],
  ['Oliver Grant', 'Site supervisor', 'Retail Park Units'],
  ['Nathan Price', 'Steel fixer', 'Riverside Apartments'],
  ['Callum Reid', 'Labourer', 'Riverside Apartments'],
  ['Ben Ashworth', 'Plant operator', 'Retail Park Units'],
  ['Zara Hussain', 'Health and safety advisor', 'Head Office'],
];

function emailFor(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@northfield-build.example`;
}

/** Which certificates each role holds. */
function certificatesFor(role: string): CertificateTypeId[] {
  if (role === 'Site manager' || role === 'Project manager') return ['cscs', 'smsts'];
  if (role === 'Site supervisor') return ['cscs', 'sssts', 'first-aid'];
  if (role === 'Labourer') return ['cscs', 'hsa'];
  if (role === 'Health and safety advisor') return ['cscs', 'smsts', 'first-aid'];
  return ['cscs'];
}

/** Small deterministic random numbers, so every visit sees the same company. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

export interface DemoWorkforce {
  employees: DemoEmployee[];
  certificates: DemoCertificate[];
}

export function buildDemoWorkforce(today: string): DemoWorkforce {
  const random = seeded(20261008);
  const employees: DemoEmployee[] = people.map(([name, role, site], index) => ({
    id: index + 1,
    name,
    email: emailFor(name),
    role,
    site,
  }));

  // Deliberate mistakes for the data checks.
  const mistyped = employees.find((e) => e.name === 'Ryan Fletcher');
  if (mistyped) mistyped.email = 'ryan.fletcher@northfield-build';
  employees.push({ id: employees.length + 1, name: 'Tom barker', email: emailFor('Tom Barker'), role: 'Bricklayer', site: 'Riverside Apartments' });

  const certificates: DemoCertificate[] = [];
  let counter = 0;
  for (const employee of employees) {
    for (const typeId of certificatesFor(employee.role)) {
      if (employee.name === 'Ben Ashworth' && typeId === 'cscs') continue; // no CSCS card on file
      if (employee.name === 'Tom barker') continue; // the duplicate has no certificates of its own
      const type = getCertificateType(typeId);
      if (!type) continue;
      const validityDays = Math.round(type.validityYears * 365.25);
      counter += 1;
      // One in nine certificates has lapsed and one in seven runs out within 90 days.
      let ageDays: number;
      if (counter % 9 === 0) ageDays = validityDays + 10 + Math.floor(random() * 120);
      else if (counter % 7 === 0) ageDays = validityDays - 5 - Math.floor(random() * 80);
      else ageDays = 60 + Math.floor(random() * (validityDays - 200));
      certificates.push({ id: counter, employeeId: employee.id, typeId, achievedOn: addDays(today, -ageDays) });
    }
  }
  return { employees, certificates };
}
