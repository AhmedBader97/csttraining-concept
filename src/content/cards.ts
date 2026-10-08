import { nvqs, type CardColour } from './nvqs';

const levelTwoTrades = nvqs.filter((nvq) => nvq.group === 'trade' && nvq.level === 2).length;

/**
 * Routes to the four main CSCS cards, from CST Training's course and NVQ pages.
 * Each step links to what CST sells for it.
 */

export interface RouteStep {
  title: string;
  detail: string;
  /** Internal link to the course or NVQ list for this step. */
  href?: string;
  linkLabel?: string;
  /** Lowest price for the step, before VAT. */
  fromPrice?: number;
}

export interface CardRoute {
  colour: CardColour;
  name: string;
  role: string;
  /** Who usually holds it, in plain words. */
  forWho: string;
  steps: RouteStep[];
  note?: string;
}

export const cardRoutes: CardRoute[] = [
  {
    colour: 'green',
    name: 'Green',
    role: 'Labourer',
    forWho: 'Labourers and new starters on site',
    steps: [
      {
        title: 'Do a health and safety course',
        detail:
          'Either the one-day CITB Health and Safety Awareness course, or the Level 1 Award in Health and Safety in a Construction Environment, online.',
        href: '/courses/hsa',
        linkLabel: 'CITB HSA course',
        fromPrice: 115,
      },
      {
        title: 'Pass the CITB HS&E test',
        detail: 'The touchscreen Health, Safety and Environment test, booked with CITB.',
      },
      {
        title: 'Apply to CSCS',
        detail: 'Send your certificate and test result to CSCS.',
      },
    ],
  },
  {
    colour: 'blue',
    name: 'Blue',
    role: 'Skilled worker',
    forWho: 'Qualified tradespeople',
    steps: [
      {
        title: 'Complete a Level 2 NVQ in your trade',
        detail: `Done remotely in 4 to 8 weeks, with evidence from your own work. ${levelTwoTrades} trades to choose from.`,
        href: '/nvqs?level=2',
        linkLabel: 'Level 2 NVQs',
        fromPrice: 895,
      },
      {
        title: 'Pass the CITB HS&E test',
        detail: 'The Health, Safety and Environment test, booked with CITB.',
      },
      {
        title: 'Apply to CSCS',
        detail: 'You can’t get a Blue card without a relevant Level 2 NVQ.',
      },
    ],
  },
  {
    colour: 'gold',
    name: 'Gold',
    role: 'Advanced craft or supervisor',
    forWho: 'Experienced tradespeople and site supervisors',
    steps: [
      {
        title: 'Complete a Level 3 or 4 NVQ',
        detail: 'A Level 3 trade NVQ for Advanced Craft, or a Level 3 or 4 supervision NVQ for Supervisor.',
        href: '/nvqs?group=supervision',
        linkLabel: 'Supervision NVQs',
        fromPrice: 1100,
      },
      {
        title: 'Pass the CITB HS&E test',
        detail: 'You can apply for a temporary card as soon as you enrol.',
      },
      {
        title: 'Apply to CSCS',
        detail: 'Send your NVQ certificate and test result to CSCS.',
      },
    ],
  },
  {
    colour: 'black',
    name: 'Black',
    role: 'Manager',
    forWho: 'Site, project and construction managers',
    steps: [
      {
        title: 'Complete a Level 6 or 7 management NVQ',
        detail: 'Done remotely in 8 to 12 weeks with a chartered assessor.',
        href: '/nvqs?group=management',
        linkLabel: 'Management NVQs',
        fromPrice: 1750,
      },
      {
        title: 'Pass the CITB MAP test',
        detail: 'The Managers and Professionals test. A temporary card is available once you enrol.',
      },
      {
        title: 'Apply to CSCS',
        detail: 'Many site managers also hold an in-date SMSTS.',
      },
    ],
    note: 'SMSTS is a certificate, not a card, but principal contractors often ask for it.',
  },
];

export function getCardRoute(colour: CardColour): CardRoute {
  const route = cardRoutes.find((item) => item.colour === colour);
  if (!route) throw new Error(`No route for the ${colour} card`);
  return route;
}

export const cardRulesNote = 'Card rules are set by CSCS. Check cscs.uk.com before you book.';
