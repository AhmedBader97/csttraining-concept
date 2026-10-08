import Link from 'next/link';
import { CourseRow } from '@/components/courses/CourseRow';
import { CardRoutePlanner } from '@/components/home/CardRoutePlanner';
import { HeroSearch } from '@/components/home/HeroSearch';
import { company } from '@/content/company';
import { getCourse } from '@/content/courses';
import { bulkBooking, citbGrant } from '@/content/funding';
import { nvqGroups, nvqProcess } from '@/content/nvqs';
import { venues } from '@/content/venues';
import { courseEntry } from '@/lib/catalogue';
import { runQuery } from '@/lib/graphql/execute';
import { formatGBP } from '@/lib/pricing';

const popular = ['smsts', 'sssts', 'hsa', 'level-1-health-safety', 'iosh-managing-safely', 'first-aid-at-work', '18th-edition', 'nebosh-general-certificate'];

interface NvqPrices {
  trade: Array<{ price: { net: number } }>;
  supervision: Array<{ price: { net: number } }>;
  management: Array<{ price: { net: number } }>;
}

export default async function HomePage() {
  // Built from the same GraphQL API the site exposes at /api/graphql.
  const prices = await runQuery<NvqPrices>(`{
    trade: nvqs(group: TRADE) { price { net } }
    supervision: nvqs(group: SUPERVISION) { price { net } }
    management: nvqs(group: MANAGEMENT) { price { net } }
  }`);
  const from = (list: Array<{ price: { net: number } }>) => Math.min(...list.map((item) => item.price.net));
  const cities = Array.from(new Set(venues.map((venue) => venue.city)));

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">Courses and NVQs for every CSCS card</h1>
            <p className="hero__lede">
              CITB-approved SMSTS, SSSTS and HSA courses live online or at {company.classroomLocations} UK venues, and construction NVQs
              from Level 2 to 7, done remotely.
            </p>
            <HeroSearch />
            <p className="hero__approvals">
              Fully approved {company.approvedBy.slice(0, -1).join(', ')} and {company.approvedBy.at(-1)} training provider.
            </p>
          </div>
          <div className="hero__planner">
            <CardRoutePlanner compact />
          </div>
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="popular-title">
        <div className="container">
          <div className="section__head">
            <h2 id="popular-title" className="section__title">
              Popular courses
            </h2>
            <Link href="/courses" className="section__more">
              All courses
            </Link>
          </div>
          <ul className="course-ledger">
            {popular.map((slug) => {
              const course = getCourse(slug);
              return course ? <CourseRow key={slug} entry={courseEntry(course)} /> : null;
            })}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="nvq-title">
        <div className="container split">
          <div className="split__lead">
            <h2 id="nvq-title" className="section__title">
              NVQs you complete from site
            </h2>
            <p className="section__lede">
              Evidence comes from the work you already do. A dedicated assessor guides you through it online, and most people finish in 4 to
              12 weeks.
            </p>
            <ol className="steps">
              {nvqProcess.map((step) => (
                <li key={step} className="steps__item">
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <ul className="nvq-groups">
            {(Object.keys(nvqGroups) as Array<keyof typeof nvqGroups>).map((group) => (
              <li key={group} className={`nvq-group nvq-group--${group}`}>
                <Link href={`/nvqs?group=${group}`} className="nvq-group__link">
                  <span className="nvq-group__name">{nvqGroups[group].label}</span>
                  <span className="nvq-group__description">{nvqGroups[group].description}</span>
                  <span className="nvq-group__price">From {formatGBP(from(prices[group]))} + VAT</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--ink" aria-labelledby="employers-title">
        <div className="container">
          <h2 id="employers-title" className="section__title">
            Training a whole team?
          </h2>
          <div className="employer-grid">
            <article className="employer-point">
              <h3 className="employer-point__title">Bulk bookings</h3>
              <p>{bulkBooking.summary}</p>
            </article>
            <article className="employer-point">
              <h3 className="employer-point__title">CITB grants</h3>
              <p>
                Registered employers can claim {formatGBP(citbGrant.amount)} for each NVQ an employee achieves.{' '}
                <Link href="/funding">Check the rules</Link>
              </p>
            </article>
            <article className="employer-point">
              <h3 className="employer-point__title">Compliance Control</h3>
              <p>
                See whose certificates run out next, and book the refresher in the same place.{' '}
                <Link href="/compliance">Try the dashboard</Link>
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="venues-title">
        <div className="container venues-strip">
          <div>
            <h2 id="venues-title" className="section__title">
              Online, or in a classroom near you
            </h2>
            <p className="section__lede">
              CITB courses run live on Zoom, at {company.classroomLocations} UK locations, or at your own site. Our permanent venues are in{' '}
              {cities.slice(0, -1).join(', ')} and {cities.at(-1)}, all with free parking.
            </p>
            <Link href="/venues" className="button button--secondary">
              See the venues
            </Link>
          </div>
          <div className="reviews-note">
            <p className="reviews-note__stars" aria-hidden="true">
              ★★★★★
            </p>
            <p className="reviews-note__text">Thousands of 5-star reviews on Trustpilot and Google.</p>
            <a href={company.reviewsUrl} className="reviews-note__link">
              Read the reviews on csttraining.co.uk
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
