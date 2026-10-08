/**
 * Short courses, with the prices, durations and rules CST Training publishes
 * (October 2026). `price` is in pounds before VAT; `null` means the real site
 * shows the price only on its dates page, so this concept says "price on request".
 */

export type Delivery = 'online' | 'classroom' | 'e-learning';

export type CourseCategory = 'citb' | 'health-safety' | 'first-aid' | 'electrical' | 'project-management';

export interface Course {
  slug: string;
  /** Short name people search for, e.g. "SMSTS". */
  name: string;
  /** Full title, e.g. "Site Management Safety Training Scheme". */
  title: string;
  category: CourseCategory;
  price: number | null;
  /** Price is a starting price ("From £115 + VAT"). */
  priceFrom?: boolean;
  wasPrice?: number;
  weekendPrice?: number;
  /** 0% finance: amount before VAT per month. */
  monthly?: { amount: number; months: number };
  duration: string;
  days: number | null;
  delivery: Delivery[];
  formats?: string[];
  /** Years the certificate lasts. `null`: doesn't expire, or the site doesn't say. */
  validityYears: number | null;
  validityNote?: string;
  /** Slug of the course that renews this one. */
  refresher?: string;
  requires?: string;
  whoFor: string;
  summary: string;
  highlights: string[];
  awardingBody: string;
  /** Path of the matching page on csttraining.co.uk. */
  sourcePath: string;
  /** Extra words people type when searching. */
  keywords?: string[];
}

export const categories: Record<CourseCategory, { label: string; description: string }> = {
  citb: {
    label: 'CITB courses',
    description: 'Site safety courses approved by CITB, online via Zoom or in a classroom.',
  },
  'health-safety': {
    label: 'Health and safety',
    description: 'NEBOSH, IOSH and site-safety certificates for managers and teams.',
  },
  'first-aid': {
    label: 'First aid',
    description: 'Highfield-accredited first aid at work.',
  },
  electrical: {
    label: 'Electrical',
    description: 'The 18th Edition wiring regulations.',
  },
  'project-management': {
    label: 'Project management',
    description: 'PRINCE2® courses, self-paced online.',
  },
};

export const deliveryLabels: Record<Delivery, string> = {
  online: 'Live online',
  classroom: 'Classroom',
  'e-learning': 'E-learning',
};

export const courses: Course[] = [
  {
    slug: 'smsts',
    name: 'SMSTS',
    title: 'Site Management Safety Training Scheme',
    category: 'citb',
    price: 495,
    duration: '5 days',
    days: 5,
    delivery: ['online', 'classroom'],
    formats: ['Monday to Friday', 'One day a week for five weeks', 'Weekends'],
    validityYears: 5,
    refresher: 'smsts-refresher',
    whoFor: 'Site managers, project managers and anyone who manages, controls or monitors a construction site.',
    summary:
      'The CITB course principal contractors ask site managers for. Covers health and safety law, the CDM Regulations, risk assessment and leading a safe site.',
    highlights: [
      'Certificate valid for 5 years',
      'Free same-day resit if you narrowly miss the pass mark',
      'Live online or at 30+ UK venues, same price',
    ],
    awardingBody: 'CITB',
    sourcePath: '/smsts/',
    keywords: ['site manager', 'project manager', 'black card', 'site management'],
  },
  {
    slug: 'smsts-refresher',
    name: 'SMSTS Refresher',
    title: 'Site Management Safety Training Scheme Refresher',
    category: 'citb',
    price: null,
    duration: '2 days',
    days: 2,
    delivery: ['online', 'classroom'],
    formats: ['Two weekdays', 'A weekend'],
    validityYears: 5,
    requires: 'An in-date CITB SMSTS certificate.',
    whoFor: 'Site managers renewing an SMSTS certificate before it expires.',
    summary: 'Renews your SMSTS for another five years. Book it before your current certificate runs out.',
    highlights: ['Keeps your SMSTS in date', 'Live online or in a classroom, same price'],
    awardingBody: 'CITB',
    sourcePath: '/smsts-r-classroom-page/',
    keywords: ['smsts-r', 'renew', 'refresher'],
  },
  {
    slug: 'sssts',
    name: 'SSSTS',
    title: 'Site Supervisor Safety Training Scheme',
    category: 'citb',
    price: 275,
    duration: '2 days',
    days: 2,
    delivery: ['online', 'classroom'],
    formats: ['Two weekdays', 'One day a week for two weeks', 'Weekends'],
    validityYears: 5,
    refresher: 'sssts-refresher',
    whoFor: 'First-line managers, site supervisors and workers about to start supervising.',
    summary:
      'The two-day CITB course for supervisors: health and safety law, toolbox talks, risk assessments and building a safety culture on site.',
    highlights: [
      'Certificate valid for 5 years',
      'Free same-day resit if you narrowly miss the pass mark',
      'Live online or at 30+ UK venues',
    ],
    awardingBody: 'CITB',
    sourcePath: '/sssts/',
    keywords: ['supervisor', 'gold card', 'site supervisor'],
  },
  {
    slug: 'sssts-refresher',
    name: 'SSSTS Refresher',
    title: 'Site Supervisor Safety Training Scheme Refresher',
    category: 'citb',
    price: null,
    duration: '1 day',
    days: 1,
    delivery: ['online', 'classroom'],
    formats: ['Weekday', 'Weekend'],
    validityYears: 5,
    requires: 'An in-date CITB SSSTS certificate.',
    whoFor: 'Supervisors renewing an SSSTS certificate before it expires.',
    summary: 'Renews your SSSTS for another five years in a single day.',
    highlights: ['Keeps your SSSTS in date', 'Weekday or weekend dates'],
    awardingBody: 'CITB',
    sourcePath: '/sssts-r-classroom-page/',
    keywords: ['sssts-r', 'renew', 'refresher'],
  },
  {
    slug: 'hsa',
    name: 'HSA',
    title: 'CITB Health and Safety Awareness',
    category: 'citb',
    price: 115,
    priceFrom: true,
    duration: '1 day',
    days: 1,
    delivery: ['online', 'classroom'],
    formats: ['Weekday', 'Weekend', 'At your company offices (minimum numbers apply)'],
    validityYears: 5,
    whoFor: 'New starters in construction, and labourers applying for the CSCS Green Labourer card.',
    summary:
      'A one-day introduction to site safety. With the CITB HS&E test, it gets you the CSCS Green Labourer card.',
    highlights: ['Needed for the Green Labourer card', 'Certificate valid for 5 years', 'Done in one day'],
    awardingBody: 'CITB',
    sourcePath: '/hsa-courses/',
    keywords: ['green card', 'labourer', 'cscs', 'health and safety awareness', 'new starter'],
  },
  {
    slug: 'level-1-health-safety',
    name: 'Level 1 Health & Safety',
    title: 'Level 1 Award in Health and Safety in a Construction Environment',
    category: 'health-safety',
    price: 150,
    duration: 'Online course and exam',
    days: null,
    delivery: ['e-learning'],
    formats: ['Study in your own time', 'Proctored online exam within a 2-week window'],
    validityYears: null,
    whoFor: 'Anyone starting out in construction who needs the Green Labourer card.',
    summary:
      'The Level 1 Award, fully online on any device. Take the exam from home with a webcam, then book your CITB test and apply for the Green Labourer card.',
    highlights: ['Course and exam included', 'Needed for the Green Labourer card', 'Certificate issued within 28 days'],
    awardingBody: 'Level 1 Award',
    sourcePath: '/level-1-health-safety-construction-environment/',
    keywords: ['green card', 'labourer', 'cscs', 'level 1'],
  },
  {
    slug: 'temporary-works-supervisor',
    name: 'TWS',
    title: 'Temporary Works Supervisor (TWSTC)',
    category: 'citb',
    price: 299,
    priceFrom: true,
    weekendPrice: 280,
    duration: '1 day',
    days: 1,
    delivery: ['online', 'classroom'],
    formats: ['Weekday', 'Weekend'],
    validityYears: null,
    whoFor: 'Supervisors responsible for temporary works on site.',
    summary: 'The CITB one-day course for temporary works supervisors. Weekend dates cost less.',
    highlights: ['£280 + VAT at weekends', '08:30 to 17:00'],
    awardingBody: 'CITB',
    sourcePath: '/tws/',
    keywords: ['temporary works', 'twstc'],
  },
  {
    slug: 'temporary-works-coordinator',
    name: 'TWC',
    title: 'Temporary Works Co-ordinator (TWCTC)',
    category: 'citb',
    price: null,
    duration: '2 days',
    days: 2,
    delivery: ['online', 'classroom'],
    validityYears: null,
    refresher: 'temporary-works-coordinator-refresher',
    whoFor: 'Anyone appointed to co-ordinate temporary works on a project.',
    summary: 'The CITB two-day course for temporary works co-ordinators.',
    highlights: ['Remote or classroom'],
    awardingBody: 'CITB',
    sourcePath: '/temporary-works-coordinator-course/',
    keywords: ['temporary works', 'twctc', 'coordinator'],
  },
  {
    slug: 'temporary-works-coordinator-refresher',
    name: 'TWC Refresher',
    title: 'Temporary Works Co-ordinator Refresher',
    category: 'citb',
    price: null,
    duration: '1 day',
    days: 1,
    delivery: ['online'],
    validityYears: null,
    requires: 'An in-date CITB TWC certificate.',
    whoFor: 'Temporary works co-ordinators renewing their certificate.',
    summary: 'A one-day remote refresher for temporary works co-ordinators.',
    highlights: ['Fully remote'],
    awardingBody: 'CITB',
    sourcePath: '/temporary-works-refresher-remote-course/',
    keywords: ['temporary works', 'refresher', 'renew'],
  },
  {
    slug: 'seats',
    name: 'SEATS',
    title: 'Site Environmental Awareness Training Scheme',
    category: 'citb',
    price: null,
    duration: '1 day',
    days: 1,
    delivery: ['online'],
    formats: ['Weekday', 'At your company offices (minimum numbers apply)'],
    validityYears: null,
    whoFor: 'Site managers and supervisors who need to manage environmental risks on site.',
    summary: 'The CITB one-day course on environmental awareness for site teams.',
    highlights: ['Remote or at your offices'],
    awardingBody: 'CITB',
    sourcePath: '/seats/',
    keywords: ['environment', 'environmental'],
  },
  {
    slug: 'directors-role-health-safety',
    name: 'DRHS',
    title: "Directors' Role for Health and Safety",
    category: 'citb',
    price: null,
    duration: '1 day',
    days: 1,
    delivery: ['online'],
    validityYears: null,
    whoFor: 'Company directors and senior managers in construction.',
    summary: 'The CITB one-day course on the health and safety duties of directors.',
    highlights: ['Fully remote'],
    awardingBody: 'CITB',
    sourcePath: '/drhs-course-remote/',
    keywords: ['director', 'board'],
  },
  {
    slug: 'cdm-awareness',
    name: 'CDM Awareness',
    title: 'CDM Regulations Awareness',
    category: 'citb',
    price: null,
    duration: '1 day',
    days: 1,
    delivery: ['online'],
    validityYears: null,
    whoFor: 'Anyone who needs to understand their duties under the CDM Regulations.',
    summary: 'A one-day remote course on the Construction (Design and Management) Regulations.',
    highlights: ['Fully remote'],
    awardingBody: 'CITB',
    sourcePath: '/cdm-awareness/',
    keywords: ['cdm', 'regulations', 'principal designer'],
  },
  {
    slug: 'iosh-managing-safely',
    name: 'IOSH Managing Safely',
    title: 'IOSH Managing Safely',
    category: 'health-safety',
    price: 390,
    priceFrom: true,
    duration: '3 days',
    days: 3,
    delivery: ['online', 'classroom'],
    formats: ['Three days in a row', 'Day release'],
    validityYears: null,
    validityNote: "Doesn't expire. IOSH recommends a refresher every 3 years.",
    whoFor: 'Team leaders, supervisors, managers and directors in any industry.',
    summary:
      'The IOSH course for anyone responsible for other people. Assessed by a multiple-choice test and a workplace risk assessment.',
    highlights: ['Certificate never expires', 'Assessment included in the price', 'Live online via Google Meet or 30+ venues'],
    awardingBody: 'IOSH',
    sourcePath: '/iosh-managing-safely',
    keywords: ['iosh', 'managing safely', 'manager'],
  },
  {
    slug: 'nebosh-general-certificate',
    name: 'NEBOSH General Certificate',
    title: 'NEBOSH National General Certificate in Occupational Health and Safety',
    category: 'health-safety',
    price: 1175,
    priceFrom: true,
    monthly: { amount: 117, months: 10 },
    duration: '10 days',
    days: 10,
    delivery: ['online', 'classroom'],
    formats: ['Ten days', 'Day release over ten weeks'],
    validityYears: null,
    whoFor: 'Managers, supervisors and anyone with health and safety management duties.',
    summary:
      'A first step into a health and safety career. An open-book exam (NG1) and a practical risk assessment (NG2), with a full mock exam and one-to-one feedback.',
    highlights: ['0% finance: £117 + VAT a month for 10 months', 'Mock exam with feedback included', 'Online or 30+ venues'],
    awardingBody: 'NEBOSH',
    sourcePath: '/nebosh-general-certificate-health-safety/',
    keywords: ['nebosh', 'general certificate', 'health and safety career'],
  },
  {
    slug: 'first-aid-at-work',
    name: 'First Aid at Work',
    title: 'Level 3 Award in First Aid at Work',
    category: 'first-aid',
    price: 215,
    duration: '3 days',
    days: 3,
    delivery: ['classroom'],
    validityYears: 3,
    whoFor: 'Anyone aged 16 or over who may need to give first aid at work.',
    summary: 'Three days in a classroom, Highfield-accredited. You must attend every day, and be able to give CPR kneeling on the floor.',
    highlights: ['Certificate valid for 3 years', 'Highfield-accredited, Ofqual-regulated'],
    awardingBody: 'Highfield',
    sourcePath: '/first-aid-at-work-level-3/',
    keywords: ['first aid', 'faw', 'first aider'],
  },
  {
    slug: '18th-edition',
    name: '18th Edition',
    title: 'City & Guilds Level 3 Award in Electrical Installations, 18th Edition (BS 7671:2018+A4:2026)',
    category: 'electrical',
    price: 290,
    wasPrice: 520,
    duration: '20 guided learning hours',
    days: null,
    delivery: ['e-learning'],
    formats: ['Self-paced modules', '2-hour, 60-question exam'],
    validityYears: null,
    whoFor: 'Electricians and tradespeople doing any electrical work, with a reasonable knowledge of BS 7671.',
    summary:
      'The current wiring regulations, updated for amendment 4. Work through the modules at your own pace, then sit a City & Guilds exam with a 60% pass mark.',
    highlights: ['Was £520, now £290 + VAT', 'City & Guilds approved'],
    awardingBody: 'City & Guilds',
    sourcePath: '/electrical-installations-18th-edition/',
    keywords: ['electrician', 'wiring regulations', 'bs7671', 'electrical'],
  },
  {
    slug: 'fire-marshal-e-learning',
    name: 'Fire Marshal',
    title: 'Fire Marshal E-Learning Course',
    category: 'health-safety',
    price: 30,
    duration: 'Self-paced',
    days: null,
    delivery: ['e-learning'],
    validityYears: null,
    whoFor: 'Staff appointed as fire marshals or wardens.',
    summary: 'A self-paced online course for fire marshals.',
    highlights: ['Start straight away'],
    awardingBody: 'CST Training e-learning',
    sourcePath: '/product/fire-marshal-e-learning-course/',
    keywords: ['fire warden', 'fire safety'],
  },
  {
    slug: 'abrasive-wheels-e-learning',
    name: 'Abrasive Wheels',
    title: 'Abrasive Wheels E-Learning Course',
    category: 'health-safety',
    price: 30,
    duration: 'Self-paced',
    days: null,
    delivery: ['e-learning'],
    validityYears: null,
    whoFor: 'Anyone who uses or changes abrasive wheels and discs.',
    summary: 'A self-paced online course on using abrasive wheels safely.',
    highlights: ['Start straight away'],
    awardingBody: 'CST Training e-learning',
    sourcePath: '/product/abrasive-wheels-e-learning/',
    keywords: ['grinder', 'disc cutter'],
  },
  {
    slug: 'prince2-7-bundle',
    name: 'PRINCE2® 7 Bundle',
    title: 'PRINCE2® 7 Foundation and Practitioner, self-paced e-learning',
    category: 'project-management',
    price: 1800,
    wasPrice: 2000,
    monthly: { amount: 180, months: 10 },
    duration: 'Self-paced',
    days: null,
    delivery: ['e-learning'],
    validityYears: null,
    whoFor: 'Project managers and anyone working on structured projects.',
    summary: 'Both PRINCE2® 7 levels, studied online at your own pace.',
    highlights: ['Was £2,000, now £1,800 + VAT', 'Or £180 + VAT a month for 10 months'],
    awardingBody: 'PeopleCert',
    sourcePath: '/product/prince2-7-bundle-self-paced-e-learning-online/',
    keywords: ['prince2', 'project management', 'practitioner', 'foundation'],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
