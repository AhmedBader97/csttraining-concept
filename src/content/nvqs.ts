/**
 * Construction NVQs and the cards they lead to, from CST Training's trade,
 * supervision and management NVQ pages (October 2026). Prices are before VAT.
 */

export type NvqGroup = 'trade' | 'supervision' | 'management';

export type CardColour = 'green' | 'blue' | 'gold' | 'black';

export interface Nvq {
  slug: string;
  /** e.g. "Bricklaying" */
  name: string;
  level: 2 | 3 | 4 | 6 | 7;
  group: NvqGroup;
  price: number;
  duration: string;
  /** The card this NVQ lets you apply for. */
  card: { colour: CardColour; scheme: 'CSCS' | 'CISRS' | 'CCDO'; label: string };
  pathways?: string;
  /** Eligible for ELCAS funding (current and ex-forces). */
  elcas?: boolean;
  /** Excluded from the CITB £600 achievement grant. */
  noCitbGrant?: boolean;
}

const TRADE_PRICE = { 2: 895, 3: 1100 } as const;

/** [name, level] pairs exactly as listed on the Level 2 & 3 page. */
const tradeList: Array<[string, 2 | 3]> = [
  ['Access Flooring', 2],
  ['Access & Rigging', 2],
  ['Access & Rigging (Offshore)', 3],
  ['Architectural Metalwork', 2],
  ['Bricklaying', 2],
  ['Bricklaying', 3],
  ['Brickwork Technicians', 2],
  ['Carpentry', 2],
  ['Carpentry', 3],
  ['Cladding', 2],
  ['Cladding', 3],
  ['Concrete Finishing', 2],
  ['Curtain Wall Installation', 2],
  ['Demolition', 2],
  ['Demolition', 3],
  ['Diamond Drilling', 2],
  ['Dry-Lining Finishing', 2],
  ['Dry-Lining Fixing', 2],
  ['Dry-Lining Boarder', 2],
  ['Engineering Surveying', 3],
  ['Fenestration Installation', 2],
  ['Fenestration Installation', 3],
  ['Fenestration Surveying', 3],
  ['Fire Stopping', 2],
  ['Floorcoverings', 3],
  ['Acoustic Flooring', 2],
  ['Formwork', 2],
  ['Formwork', 3],
  ['Fitted Interiors', 2],
  ['Glass Related Occupations', 2],
  ['Glazing', 2],
  ['Glazing', 3],
  ['Groundworks', 2],
  ['Heritage Architectural Joinery', 2],
  ['Insulation & Building Treatments', 2],
  ['Insulation & Building Treatments', 3],
  ['Interior Systems', 3],
  ['Land Drilling', 2],
  ['Mastic', 2],
  ['Modular Building', 2],
  ['Multi-trade', 2],
  ['Plastering', 2],
  ['Plastering', 3],
  ['Painting & Decorating', 2],
  ['Painting & Decorating', 3],
  ['Precast Concrete', 2],
  ['Piling', 2],
  ['Rendering', 2],
  ['Road Building', 2],
  ['Roofing', 2],
  ['Roofing', 3],
  ['Scaffolding', 2],
  ['Scaffolding', 3],
  ['Shopfitting', 2],
  ['Shopfitting', 3],
  ['Solar Panels', 2],
  ['Specialist Installation Occupations', 2],
  ['Steel Fixing', 2],
  ['Steel Fixing', 3],
  ['Site Logistics', 2],
  ['Stonemason', 2],
  ['SFS', 2],
  ['Tiling', 2],
  ['Tiling', 3],
  ['Flat Roof', 2],
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tradeCard(name: string, level: 2 | 3): Nvq['card'] {
  if (name === 'Scaffolding') {
    return level === 2
      ? { colour: 'blue', scheme: 'CISRS', label: 'Blue CISRS card' }
      : { colour: 'gold', scheme: 'CISRS', label: 'Gold CISRS card' };
  }
  if (name === 'Demolition') {
    // Both levels are listed with the Blue CCDO card on the Level 2 & 3 page.
    return { colour: 'blue', scheme: 'CCDO', label: 'Blue CCDO card' };
  }
  return level === 2
    ? { colour: 'blue', scheme: 'CSCS', label: 'Blue Skilled Worker card' }
    : { colour: 'gold', scheme: 'CSCS', label: 'Gold Advanced Craft card' };
}

const trade: Nvq[] = tradeList.map(([name, level]) => ({
  slug: `${slugify(name)}-level-${level}`,
  name,
  level,
  group: 'trade',
  price: TRADE_PRICE[level],
  duration: '4–8 weeks',
  card: tradeCard(name, level),
}));

const goldSupervisor: Nvq['card'] = { colour: 'gold', scheme: 'CSCS', label: 'Gold Supervisor card' };
const blackManager: Nvq['card'] = { colour: 'black', scheme: 'CSCS', label: 'Black Manager card' };

const supervision: Nvq[] = [
  {
    slug: 'occupational-work-supervision-level-3',
    name: 'Occupational Work Supervision',
    level: 3,
    group: 'supervision',
    price: 1100,
    duration: '4–8 weeks',
    card: goldSupervisor,
  },
  {
    slug: 'construction-contracting-operations-level-3',
    name: 'Construction Contracting Operations',
    level: 3,
    group: 'supervision',
    price: 1100,
    duration: '4–8 weeks',
    card: goldSupervisor,
  },
  {
    slug: 'site-supervision-level-4',
    name: 'Site Supervision',
    level: 4,
    group: 'supervision',
    price: 1400,
    duration: '4–8 weeks',
    card: goldSupervisor,
    elcas: true,
  },
];

const management: Nvq[] = [
  {
    slug: 'construction-site-management-level-6',
    name: 'Construction Site Management',
    level: 6,
    group: 'management',
    price: 1750,
    duration: '8–12 weeks',
    card: blackManager,
    elcas: true,
  },
  {
    slug: 'construction-senior-management-level-7',
    name: 'Construction Senior Management',
    level: 7,
    group: 'management',
    price: 1995,
    duration: '8–12 weeks',
    card: blackManager,
    elcas: true,
    noCitbGrant: true,
  },
  {
    slug: 'construction-contracting-operations-general-level-6',
    name: 'Construction Contracting Operations: General',
    level: 6,
    group: 'management',
    price: 1750,
    duration: '8–12 weeks',
    card: blackManager,
    elcas: true,
  },
  {
    slug: 'construction-contracting-operations-specialist-level-6',
    name: 'Construction Contracting Operations: Specialist',
    level: 6,
    group: 'management',
    price: 1750,
    duration: '8–12 weeks',
    card: blackManager,
    pathways: 'Planning, estimating, surveying and buying pathways',
  },
  {
    slug: 'senior-site-inspection-level-6',
    name: 'Senior Site Inspection',
    level: 6,
    group: 'management',
    price: 1800,
    duration: '8–12 weeks',
    card: blackManager,
  },
];

export const nvqs: Nvq[] = [...trade, ...supervision, ...management];

export const nvqGroups: Record<NvqGroup, { label: string; description: string }> = {
  trade: { label: 'Trade NVQs', description: 'Levels 2 and 3 in 50 trades, for the Blue or Gold card.' },
  supervision: { label: 'Supervision NVQs', description: 'Levels 3 and 4, for the Gold Supervisor card.' },
  management: { label: 'Management NVQs', description: 'Levels 6 and 7, for the Black Manager card.' },
};

/** How every NVQ is done, from the NVQ pages. */
export const nvqProcess = [
  'Induction with your assessor',
  'Gather evidence from your work, such as RAMS, toolbox talks and programmes',
  'Get a witness testimony from a competent person',
  'Answer knowledge questions',
  'Have a professional discussion with your assessor',
] as const;

export const nvqFacts = [
  'Completed remotely through an online portfolio',
  'A dedicated assessor from start to finish',
  'CITB and Ofqual approved, across the whole UK',
  'Awarding bodies include NOCN, GQA, ProQual and Qualifications Scotland Accreditation',
] as const;

export function getNvq(slug: string): Nvq | undefined {
  return nvqs.find((nvq) => nvq.slug === slug);
}

/** "Blue card", "Gold CISRS card": short enough for lists. */
export function shortCardLabel(card: Nvq['card']): string {
  const colour = card.colour[0]!.toUpperCase() + card.colour.slice(1);
  return card.scheme === 'CSCS' ? `${colour} card` : `${colour} ${card.scheme} card`;
}

export function nvqTitle(nvq: Pick<Nvq, 'name' | 'level'>): string {
  return `Level ${nvq.level} NVQ in ${nvq.name}`;
}
