import { buildSchema } from 'graphql';
import { categories, courses, getCourse, type Course, type Delivery } from '@/content/courses';
import { getNvq, nvqs, nvqTitle, type Nvq, type NvqGroup } from '@/content/nvqs';
import { venues } from '@/content/venues';
import { buildCatalogue, searchCatalogue } from '@/lib/catalogue';
import { priceLabel, withVat } from '@/lib/pricing';

/**
 * The course catalogue as a GraphQL API. Pages query it in-process when they
 * are built, and anyone can query it over HTTP at /api/graphql.
 */
export const typeDefs = /* GraphQL */ `
  enum Delivery {
    ONLINE
    CLASSROOM
    E_LEARNING
  }

  enum NvqGroup {
    TRADE
    SUPERVISION
    MANAGEMENT
  }

  "A price before and after 20% VAT. Null amounts mean the price is on request."
  type Price {
    net: Float
    gross: Float
    from: Boolean!
    label: String!
  }

  type Course {
    slug: ID!
    name: String!
    title: String!
    category: String!
    categoryLabel: String!
    price: Price!
    wasPrice: Float
    duration: String!
    days: Int
    delivery: [Delivery!]!
    "Years the certificate lasts; null if it doesn't expire"
    validityYears: Int
    refresher: Course
    whoFor: String!
    summary: String!
    highlights: [String!]!
    awardingBody: String!
  }

  type Card {
    colour: String!
    scheme: String!
    label: String!
  }

  type Nvq {
    slug: ID!
    title: String!
    trade: String!
    level: Int!
    group: NvqGroup!
    price: Price!
    duration: String!
    card: Card!
    elcas: Boolean!
    "CITB-registered employers can claim the achievement grant"
    citbGrant: Boolean!
  }

  type SearchResult {
    type: String!
    slug: ID!
    title: String!
    subtitle: String!
    href: String!
    price: Price!
  }

  type Venue {
    slug: ID!
    city: String!
    region: String!
    name: String!
    address: [String!]!
    postcode: String!
    parking: String!
  }

  type Query {
    courses(category: String, delivery: Delivery): [Course!]!
    course(slug: ID!): Course
    nvqs(group: NvqGroup, level: Int, trade: String): [Nvq!]!
    nvq(slug: ID!): Nvq
    search(query: String!, limit: Int = 8): [SearchResult!]!
    venues: [Venue!]!
  }
`;

export const schema = buildSchema(typeDefs);

const toEnum = (delivery: Delivery) => delivery.toUpperCase().replace('-', '_');
const fromEnum = (value: string) => value.toLowerCase().replace('_', '-') as Delivery;

function price(net: number | null, from = false) {
  return { net, gross: net == null ? null : withVat(net), from, label: priceLabel({ price: net, priceFrom: from }) };
}

function courseNode(course: Course): Record<string, unknown> {
  return {
    ...course,
    categoryLabel: categories[course.category].label,
    price: price(course.price, Boolean(course.priceFrom)),
    wasPrice: course.wasPrice ?? null,
    delivery: course.delivery.map(toEnum),
    // Resolved only when the query asks for it.
    refresher: () => {
      const refresher = course.refresher ? getCourse(course.refresher) : undefined;
      return refresher ? courseNode(refresher) : null;
    },
  };
}

function nvqNode(nvq: Nvq): Record<string, unknown> {
  return {
    slug: nvq.slug,
    title: nvqTitle(nvq),
    trade: nvq.name,
    level: nvq.level,
    group: nvq.group.toUpperCase(),
    price: price(nvq.price),
    duration: nvq.duration,
    card: nvq.card,
    elcas: Boolean(nvq.elcas),
    citbGrant: !nvq.noCitbGrant,
  };
}

const catalogue = buildCatalogue();

export const rootValue = {
  courses: ({ category, delivery }: { category?: string; delivery?: string }) =>
    courses
      .filter((course) => !category || course.category === category)
      .filter((course) => !delivery || course.delivery.includes(fromEnum(delivery)))
      .map(courseNode),
  course: ({ slug }: { slug: string }) => {
    const course = getCourse(slug);
    return course ? courseNode(course) : null;
  },
  nvqs: ({ group, level, trade }: { group?: string; level?: number; trade?: string }) =>
    nvqs
      .filter((nvq) => !group || nvq.group === (group.toLowerCase() as NvqGroup))
      .filter((nvq) => level == null || nvq.level === level)
      .filter((nvq) => !trade || nvq.name.toLowerCase().includes(trade.toLowerCase()))
      .map(nvqNode),
  nvq: ({ slug }: { slug: string }) => {
    const nvq = getNvq(slug);
    return nvq ? nvqNode(nvq) : null;
  },
  search: ({ query, limit }: { query: string; limit: number }) =>
    searchCatalogue(catalogue, query, Math.min(Math.max(limit, 1), 50)).map((entry) => ({
      ...entry,
      price: price(entry.price, entry.priceFrom),
    })),
  venues: () => venues,
};
