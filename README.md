# CST Training: redesign concept

**Live: [cst-training-concept-by-ahmed.vercel.app](https://cst-training-concept-by-ahmed.vercel.app)**

An **unofficial** redesign of [csttraining.co.uk](https://www.csttraining.co.uk), built by Ahmed Bader as part of an application for CST Training's Junior Frontend Developer role. It isn't affiliated with CST Training, it's hidden from search engines, and nothing typed into it is sent anywhere.

Course names, prices, durations, NVQs, venues and funding rules come from the current site (October 2026). The Compliance Control dashboard uses a made-up company.

## What's in it

| The advert asks for | Where to see it |
| --- | --- |
| Responsive interfaces with modern frontend technology | Every page: Next.js, React, TypeScript, SASS with BEM, from a 320px phone up |
| REST and GraphQL APIs | `/api/graphql`, `/api/courses`, `/api/nvqs`, `POST /api/quote`; try them on the How it was built page |
| CRM and system integrations | Checkout builds the WooCommerce order, HubSpot contact and deal, and n8n event, and shows them instead of sending |
| User-facing features for training platforms | CSCS card route planner, live search, NVQ finder, booking panel |
| Data presentation and reporting dashboards | `/compliance`: a working concept of Compliance Control |
| Data accuracy | SQL data checks and a CSV import that checks every row |
| HubSpot, n8n, PHP and WooCommerce | `src/lib/integrations/`, `integrations/n8n/`, `integrations/woocommerce/`, `integrations/hubspot/` |
| SQL | SQLite in the browser (sql.js); the queries are in `src/lib/sql/compliance-db.ts` |

## Running it

```bash
npm install      # also copies the sql.js WebAssembly into public/
npm run dev      # http://localhost:3000
npm test         # Jest, Testing Library and axe
npm run build
```

Node 20.9 or later.

## How it's organised

```
src/
  app/                 pages and API routes (Next.js App Router)
  components/          UI, grouped by feature; tests sit next to each group
  content/             courses, NVQs, card routes, venues, funding (from csttraining.co.uk)
  lib/
    graphql/           the catalogue schema, queried at build time and at /api/graphql
    integrations/      WooCommerce, HubSpot and n8n payload builders
    sql/               the Compliance Control database and its queries
  styles/              SASS: tokens, base, layout, one partial per component
integrations/          the n8n workflow, the WordPress plugin and HubSpot setup notes
```

## Notes

- Prices are before VAT, as on the real site. VAT-inclusive figures are worked out at 20%.
- Course dates in the booking panel are examples; a real build would read them from the booking system.
- Page views are counted with Vercel Web Analytics (no cookies). Opening any page with `?me` stops your own visits being counted.
