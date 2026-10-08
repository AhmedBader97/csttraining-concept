import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingPanel } from '@/components/courses/BookingPanel';
import { DeliveryList } from '@/components/shared/DeliveryList';
import { PriceTag } from '@/components/shared/PriceTag';
import { company } from '@/content/company';
import { categories, courses, getCourse } from '@/content/courses';
import { formatGBP } from '@/lib/pricing';

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const course = getCourse((await params).slug);
  return course ? { title: `${course.name}: ${course.title}`, description: course.summary } : {};
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const course = getCourse((await params).slug);
  if (!course) notFound();
  const refresher = course.refresher ? getCourse(course.refresher) : undefined;
  const renews = courses.find((other) => other.refresher === course.slug);
  const validity = course.validityYears
    ? `${course.validityYears} years`
    : course.validityNote ?? 'Not stated by the awarding body';

  return (
    <>
      <header className="page-head course-head">
        <div className="container course-head__grid">
          <div>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li><Link href="/courses">Courses</Link></li>
                <li><Link href={`/courses?category=${course.category}`}>{categories[course.category].label}</Link></li>
                <li aria-current="page">{course.name}</li>
              </ol>
            </nav>
            <h1 className="page-head__title">{course.name}</h1>
            <p className="course-head__title">{course.title}</p>
            <p className="page-head__lede">{course.summary}</p>
          </div>
          <div className="course-head__price">
            <PriceTag price={course.price} from={course.priceFrom} was={course.wasPrice} size="large" />
            {course.monthly ? (
              <p className="course-head__monthly">
                or {formatGBP(course.monthly.amount)} + VAT a month for {course.monthly.months} months, 0% finance
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="container course-body">
        <div className="course-body__main">
          <dl className="facts">
            <div className="facts__item">
              <dt>Duration</dt>
              <dd>{course.duration}</dd>
            </div>
            <div className="facts__item">
              <dt>Delivered</dt>
              <dd><DeliveryList delivery={course.delivery} /></dd>
            </div>
            <div className="facts__item">
              <dt>Certificate lasts</dt>
              <dd>{validity}</dd>
            </div>
            <div className="facts__item">
              <dt>Awarded by</dt>
              <dd>{course.awardingBody}</dd>
            </div>
          </dl>

          <section className="course-section" aria-labelledby="who">
            <h2 id="who">Who it’s for</h2>
            <p>{course.whoFor}</p>
            {course.requires ? <p className="course-section__requires">You need: {course.requires}</p> : null}
          </section>

          <section className="course-section" aria-labelledby="included">
            <h2 id="included">What you get</h2>
            <ul className="ticks">
              {course.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {course.formats?.length ? (
            <section className="course-section" aria-labelledby="formats">
              <h2 id="formats">Ways to take it</h2>
              <ul className="ticks">
                {course.formats.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {refresher || renews ? (
            <section className="course-section" aria-labelledby="renewing">
              <h2 id="renewing">Renewing</h2>
              {refresher ? (
                <p>
                  When your certificate is due, the <Link href={`/courses/${refresher.slug}`}>{refresher.name}</Link> renews it. Employers can
                  track expiry dates in <Link href="/compliance">Compliance Control</Link>.
                </p>
              ) : null}
              {renews ? (
                <p>
                  This renews the <Link href={`/courses/${renews.slug}`}>{renews.name}</Link>. Book it before your current certificate runs out.
                </p>
              ) : null}
            </section>
          ) : null}

          <p className="course-source">
            Details from CST Training’s <a href={`${company.site}${course.sourcePath}`}>{course.name} page</a>.
          </p>
        </div>

        <aside className="course-body__aside">
          <BookingPanel course={course} />
        </aside>
      </div>
    </>
  );
}
