import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CourseCatalogue } from '@/components/courses/CourseCatalogue';
import { courses } from '@/content/courses';
import { courseEntry } from '@/lib/catalogue';
import { runQuery } from '@/lib/graphql/execute';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'CITB, NEBOSH, IOSH, first aid and e-learning courses with prices and how each is delivered.',
};

export default async function CoursesPage() {
  // The list comes through the GraphQL API; the rest of each entry is shaped for search.
  const data = await runQuery<{ courses: Array<{ slug: string }> }>('{ courses { slug } }');
  const entries = data.courses
    .map(({ slug }) => courses.find((course) => course.slug === slug))
    .filter((course): course is (typeof courses)[number] => Boolean(course))
    .map((course) => ({ ...courseEntry(course), category: course.category }));

  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">Courses</h1>
          <p className="page-head__lede">
            Prices are per person before VAT. CITB courses cost the same online or in a classroom. Looking for an NVQ or a CSCS card? Try the{' '}
            <Link href="/nvqs">NVQ finder</Link> or <Link href="/cscs-cards">card routes</Link>.
          </p>
        </div>
      </header>
      <section className="section section--tight">
        <div className="container">
          <Suspense fallback={<p>Loading courses…</p>}>
            <CourseCatalogue entries={entries} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
