import { getCourse } from '@/content/courses';
import { getNvq } from '@/content/nvqs';
import { basketTotals, MAX_PLACES, type BasketItem } from '@/lib/basket';

/**
 * REST: POST /api/quote  { "items": [{ "slug": "smsts", "places": 2 }] }
 *
 * Prices a basket on the server from the catalogue, so a price changed in the
 * browser can never reach an order.
 */
interface QuoteRequest {
  items?: Array<{ slug?: unknown; places?: unknown }>;
}

export async function POST(request: Request) {
  let body: QuoteRequest;
  try {
    body = (await request.json()) as QuoteRequest;
  } catch {
    return Response.json({ error: 'Send JSON like {"items":[{"slug":"smsts","places":1}]}.' }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) {
    return Response.json({ error: 'Send between 1 and 20 items.' }, { status: 400 });
  }

  const lines: BasketItem[] = [];
  const unknown: string[] = [];
  for (const raw of body.items) {
    const slug = typeof raw.slug === 'string' ? raw.slug : '';
    const places = typeof raw.places === 'number' && Number.isInteger(raw.places) ? raw.places : NaN;
    if (!(places >= 1 && places <= MAX_PLACES)) {
      return Response.json({ error: `Places must be a whole number from 1 to ${MAX_PLACES}.` }, { status: 400 });
    }
    const course = getCourse(slug);
    const nvq = course ? undefined : getNvq(slug);
    if (!course && !nvq) {
      unknown.push(slug);
      continue;
    }
    lines.push({
      id: slug,
      kind: course ? 'course' : 'nvq',
      slug,
      name: course ? course.name : `Level ${nvq!.level} NVQ in ${nvq!.name}`,
      unitPrice: course ? course.price : nvq!.price,
      places,
    });
  }
  if (unknown.length) return Response.json({ error: `Unknown course or NVQ: ${unknown.join(', ')}` }, { status: 422 });

  return Response.json({ lines, totals: basketTotals({ items: lines }) }, { headers: { 'Cache-Control': 'no-store' } });
}
