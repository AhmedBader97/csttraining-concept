import type { Metadata } from 'next';
import Link from 'next/link';
import { CardRoutePlanner } from '@/components/home/CardRoutePlanner';
import { CardChip } from '@/components/shared/CardChip';
import { cardRoutes, cardRulesNote } from '@/content/cards';
import { formatGBP } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Which CSCS card do I need?',
  description: 'The Green, Blue, Gold and Black CSCS cards: who needs each one, and the courses, NVQs and tests that get you there.',
};

export default function CardsPage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">Which CSCS card do you need?</h1>
          <p className="page-head__lede">
            Most sites won’t let you on without a CSCS card, and the colour depends on your job. Pick yours to see what it takes.
          </p>
        </div>
      </header>

      <section className="section section--tight">
        <div className="container cards-page">
          <CardRoutePlanner initial="green" />

          <div className="cards-table-wrap">
            <h2 className="cards-table__title">All four at a glance</h2>
            <table className="cards-table">
              <caption className="visually-hidden">CSCS cards, who holds them and the cheapest way in</caption>
              <thead>
                <tr>
                  <th scope="col">Card</th>
                  <th scope="col">Usually for</th>
                  <th scope="col">Main requirement</th>
                  <th scope="col">From</th>
                </tr>
              </thead>
              <tbody>
                {cardRoutes.map((route) => {
                  const first = route.steps[0]!;
                  return (
                    <tr key={route.colour}>
                      <th scope="row">
                        <CardChip colour={route.colour} label={`${route.name}: ${route.role}`} />
                      </th>
                      <td>{route.forWho}</td>
                      <td>{first.href ? <Link href={first.href}>{first.title}</Link> : first.title}</td>
                      <td>{first.fromPrice ? `${formatGBP(first.fromPrice)} + VAT` : 'Varies'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="cards-table__note">{cardRulesNote} Specialist schemes (CISRS for scaffolders, CCDO for demolition) issue their own cards.</p>
          </div>
        </div>
      </section>
    </>
  );
}
