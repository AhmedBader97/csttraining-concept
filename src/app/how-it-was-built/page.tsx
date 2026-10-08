import type { Metadata } from 'next';
import Link from 'next/link';
import { ApiPlayground } from '@/components/concept/ApiPlayground';
import { concept } from '@/config/site';
import { metrics } from '@/config/metrics';
import { nvqs } from '@/content/nvqs';

export const metadata: Metadata = {
  title: 'How it was built',
  description: 'How each part of this CST Training concept answers a line of the Junior Frontend Developer advert.',
};

const code = (path: string) => `${concept.repoUrl}/blob/main/${path}`;

const advert: Array<{ line: string; built: string; see: { href: string; label: string }; files: string[] }> = [
  {
    line: 'Build and maintain responsive web interfaces using modern frontend technologies',
    built: 'Next.js and React with TypeScript, styled in SASS with BEM. Every page works from a 320px phone up, and the header, filters and tables reflow rather than shrink.',
    see: { href: '/', label: 'Any page, at any width' },
    files: ['src/styles/main.scss', 'src/app/layout.tsx'],
  },
  {
    line: 'Integrate frontend applications with APIs (REST and GraphQL)',
    built: 'The catalogue is a GraphQL API that pages query when they’re built. The same data is served as REST, and the basket is re-priced on the server through POST /api/quote.',
    see: { href: '#apis', label: 'Try the APIs below' },
    files: ['src/lib/graphql/schema.ts', 'src/app/api/quote/route.ts'],
  },
  {
    line: 'Collaborate with the team to ensure smooth CRM and system integrations',
    built: 'Checkout builds the WooCommerce order, the HubSpot contact upsert and deal, and the n8n event, then shows them instead of sending. The repo has the n8n workflow and the WordPress plugin that would send it.',
    see: { href: '/basket', label: 'Book something, then place it' },
    files: ['src/lib/integrations/hubspot.ts', 'integrations/n8n/booking-to-hubspot.json', 'integrations/woocommerce/cst-booking-webhook.php'],
  },
  {
    line: 'Support the development of user-facing features for our training platforms',
    built: `A CSCS card route planner, live search, an NVQ finder across ${nvqs.length} NVQs, and a booking panel that handles online, classroom and weekend prices.`,
    see: { href: '/cscs-cards', label: 'Which card do I need?' },
    files: ['src/components/home/CardRoutePlanner.tsx', 'src/components/courses/BookingPanel.tsx'],
  },
  {
    line: 'Assist with data presentation and reporting dashboards',
    built: 'A working concept of Compliance Control: compliance rate, an expiry forecast chart, sites by risk, and renewals you can book straight into the basket.',
    see: { href: '/compliance', label: 'The dashboard' },
    files: ['src/components/compliance/ComplianceDashboard.tsx'],
  },
  {
    line: 'Help maintain data accuracy across our systems',
    built: 'The dashboard’s records sit in a real SQLite database in the browser. Data checks find duplicate people, bad emails and missing cards, and the CSV import checks every row before saving anything.',
    see: { href: '/compliance#checks-title', label: 'Data checks and import' },
    files: ['src/lib/sql/compliance-db.ts', 'src/lib/csv.ts'],
  },
  {
    line: 'Participate in code reviews and contribute to improving our codebase',
    built: `${metrics.tests} automated tests, typed throughout, with GitHub Actions running the type check, tests and a production build on every push.`,
    see: { href: concept.repoUrl, label: 'The code on GitHub' },
    files: ['.github/workflows/ci.yml'],
  },
];

const checks = [
  {
    title: 'CITB grant amounts differ between pages',
    detail: 'The Level 2 & 3 NVQ page says levy payers can claim up to £1,500 per NVQ achievement; the CITB Funding page and the supervision and management pages say £600.',
  },
  {
    title: 'Two review counts',
    detail: 'The homepage mentions over three thousand 5-star Trustpilot reviews; the SMSTS Refresher locations page says over 5 thousand.',
  },
  {
    title: 'A venue address with the wrong town',
    detail: 'On Our Venues, the Milton Keynes entry begins “Our Chelmsford address is”.',
  },
];

export default function HowItWasBuiltPage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">How it was built</h1>
          <p className="page-head__lede">
            I’m {concept.author}, and I built this unofficial concept of csttraining.co.uk for the Junior Frontend Developer role. Each part
            answers a line of the advert. Course names, prices and rules come from the current site.
          </p>
        </div>
      </header>

      <section className="section section--tight" aria-labelledby="advert-title">
        <div className="container">
          <h2 id="advert-title" className="section__title">
            The advert, line by line
          </h2>
          <ul className="advert">
            {advert.map((item) => (
              <li key={item.line} className="advert__item">
                <h3 className="advert__line">{item.line}</h3>
                <p className="advert__built">{item.built}</p>
                <p className="advert__links">
                  <Link href={item.see.href}>{item.see.label}</Link>
                  {item.files.map((file) => (
                    <a key={file} href={code(file)} className="advert__file">
                      {file}
                    </a>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="apis" className="section section--concrete" aria-labelledby="api-title">
        <div className="container split">
          <div>
            <h2 id="api-title" className="section__title">
              Try the APIs
            </h2>
            <p className="section__lede">
              These run against this site’s own endpoints. Today the data comes from files in the repo. Pointing the same schema at the
              WooCommerce Store API would only change the resolvers, and there’s a tested adapter for its product format already.
            </p>
          </div>
          <ApiPlayground />
        </div>
      </section>

      <section className="section" aria-labelledby="flow-title">
        <div className="container">
          <h2 id="flow-title" className="section__title">
            How a booking would flow
          </h2>
          <ol className="flow">
            <li className="flow__step">
              <span className="flow__name">Website</span>
              <span className="flow__what">Next.js: search, booking, basket</span>
            </li>
            <li className="flow__step">
              <span className="flow__name">WooCommerce</span>
              <span className="flow__what">Products, orders and payment</span>
            </li>
            <li className="flow__step">
              <span className="flow__name">n8n</span>
              <span className="flow__what">Automation between systems</span>
            </li>
            <li className="flow__step">
              <span className="flow__name">HubSpot</span>
              <span className="flow__what">Contacts, deals and coordinator tasks</span>
            </li>
            <li className="flow__step">
              <span className="flow__name">Compliance Control</span>
              <span className="flow__what">Certificates and renewal reminders</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="checks-heading">
        <div className="container">
          <h2 id="checks-heading" className="section__title">
            Things I spotted on the current site
          </h2>
          <p className="section__lede">Small inconsistencies I found while copying the content across. Easy to fix, and the kind of thing the data accuracy part of the role would catch.</p>
          <ul className="spotted">
            {checks.map((check) => (
              <li key={check.title} className="spotted__item">
                <h3 className="spotted__title">{check.title}</h3>
                <p>{check.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="stack-title">
        <div className="container split">
          <div>
            <h2 id="stack-title" className="section__title">
              Built with
            </h2>
          </div>
          <ul className="ticks ticks--columns">
            <li>Next.js 16 and React 19, TypeScript in strict mode</li>
            <li>SASS with BEM, no CSS framework</li>
            <li>GraphQL (graphql-js) and REST route handlers</li>
            <li>SQLite in the browser with sql.js</li>
            <li>Jest, Testing Library and axe for accessibility checks</li>
            <li>Archivo, one variable font with a width axis</li>
            <li>Vercel hosting and cookie-free page counts</li>
            <li>GitHub Actions for type checks, tests and builds</li>
          </ul>
        </div>
      </section>
    </>
  );
}
