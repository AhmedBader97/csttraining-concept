import { nvqs, nvqTitle, type NvqGroup } from '@/content/nvqs';
import { withVat } from '@/lib/pricing';

/** REST: GET /api/nvqs?group=trade&level=2 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const group = params.get('group') as NvqGroup | null;
  const level = params.get('level');
  const results = nvqs
    .filter((nvq) => !group || nvq.group === group)
    .filter((nvq) => !level || nvq.level === Number(level))
    .map((nvq) => ({
      slug: nvq.slug,
      title: nvqTitle(nvq),
      level: nvq.level,
      group: nvq.group,
      price_net: nvq.price,
      price_gross: withVat(nvq.price),
      duration: nvq.duration,
      card: nvq.card.label,
      url: `/nvqs/${nvq.slug}`,
    }));
  return Response.json({ count: results.length, nvqs: results }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
