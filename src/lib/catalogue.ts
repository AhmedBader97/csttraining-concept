import { categories, courses, deliveryLabels, type Course, type Delivery } from '@/content/courses';
import { nvqGroups, nvqs, nvqTitle, type Nvq } from '@/content/nvqs';

/** One searchable thing CST sells: a course or an NVQ. */
export interface CatalogueEntry {
  type: 'course' | 'nvq';
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  group: string;
  price: number | null;
  priceFrom: boolean;
  duration: string;
  delivery: Delivery[];
  level?: number;
  keywords: string[];
}

export function courseEntry(course: Course): CatalogueEntry {
  return {
    type: 'course',
    slug: course.slug,
    href: `/courses/${course.slug}`,
    title: course.name,
    subtitle: course.title,
    group: categories[course.category].label,
    price: course.price,
    priceFrom: Boolean(course.priceFrom),
    duration: course.duration,
    delivery: course.delivery,
    keywords: [course.category, course.awardingBody, ...course.delivery.map((d) => deliveryLabels[d]), ...(course.keywords ?? [])],
  };
}

export function nvqEntry(nvq: Nvq): CatalogueEntry {
  return {
    type: 'nvq',
    slug: nvq.slug,
    href: `/nvqs/${nvq.slug}`,
    title: nvqTitle(nvq),
    subtitle: `Leads to the ${nvq.card.label}`,
    group: nvqGroups[nvq.group].label,
    price: nvq.price,
    priceFrom: false,
    duration: nvq.duration,
    delivery: ['online'],
    level: nvq.level,
    keywords: ['nvq', `level ${nvq.level}`, nvq.card.label, `${nvq.card.colour} card`, nvq.group, nvq.pathways ?? ''],
  };
}

export function buildCatalogue(): CatalogueEntry[] {
  return [...courses.map(courseEntry), ...nvqs.map(nvqEntry)];
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Ranks entries for a free-text query. Every word has to match somewhere;
 * matches in the name count most, then the full title, then keywords.
 */
export function searchCatalogue(entries: CatalogueEntry[], query: string, limit = Infinity): CatalogueEntry[] {
  const words = normalise(query).split(' ').filter(Boolean);
  if (words.length === 0) return entries.slice(0, limit);

  const scored: Array<{ entry: CatalogueEntry; score: number }> = [];
  for (const entry of entries) {
    const title = normalise(entry.title);
    const subtitle = normalise(entry.subtitle);
    const keywords = normalise(entry.keywords.join(' '));
    const group = normalise(entry.group);
    let score = 0;
    let matchedAll = true;
    for (const word of words) {
      const inTitle = title.split(' ').some((part) => part.startsWith(word));
      if (inTitle) score += title.startsWith(word) ? 12 : 8;
      else if (subtitle.includes(word)) score += 5;
      else if (keywords.includes(word)) score += 4;
      else if (group.includes(word)) score += 2;
      else {
        matchedAll = false;
        break;
      }
    }
    if (!matchedAll) continue;
    if (title === normalise(query)) score += 20;
    // Courses before NVQs when the score ties: they're the quicker purchase.
    scored.push({ entry, score: score + (entry.type === 'course' ? 0.5 : 0) });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((item) => item.entry);
}
