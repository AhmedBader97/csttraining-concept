import { courses, type CourseCategory, type Delivery } from '@/content/courses';
import { withVat } from '@/lib/pricing';

/**
 * REST: GET /api/courses?category=citb&delivery=online
 * The same catalogue the GraphQL endpoint serves, for clients that prefer REST.
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const category = params.get('category') as CourseCategory | null;
  const delivery = params.get('delivery') as Delivery | null;
  const results = courses
    .filter((course) => !category || course.category === category)
    .filter((course) => !delivery || course.delivery.includes(delivery))
    .map((course) => ({
      slug: course.slug,
      name: course.name,
      title: course.title,
      category: course.category,
      price_net: course.price,
      price_gross: course.price == null ? null : withVat(course.price),
      price_from: Boolean(course.priceFrom),
      duration: course.duration,
      delivery: course.delivery,
      url: `/courses/${course.slug}`,
    }));
  return Response.json({ count: results.length, courses: results }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
