import { getCourse } from '@/content/courses';
import { withVat } from '@/lib/pricing';

/** REST: GET /api/courses/smsts */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return Response.json({ error: `No course called "${slug}".` }, { status: 404 });
  return Response.json({
    ...course,
    price_net: course.price,
    price_gross: course.price == null ? null : withVat(course.price),
  });
}
