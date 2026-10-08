import type { Metadata } from 'next';
import Link from 'next/link';
import { PaymentPlans } from '@/components/nvqs/PaymentPlans';
import { bulkBooking, citbGrant, elcas } from '@/content/funding';
import { nvqs } from '@/content/nvqs';
import { formatGBP } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'CITB grants, funding and payment plans',
  description: 'How CITB-registered employers claim £600 per NVQ, ELCAS funding for forces leavers, and the four ways to pay for an NVQ.',
};

export default function FundingPage() {
  const elcasNvqs = nvqs.filter((nvq) => nvq.elcas);
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">Grants, funding and ways to pay</h1>
          <p className="page-head__lede">{citbGrant.summary}</p>
        </div>
      </header>

      <div className="container funding">
        <section className="funding__block" aria-labelledby="citb">
          <h2 id="citb">CITB achievement grant: {formatGBP(citbGrant.amount)} per NVQ</h2>
          <ul className="ticks">
            {citbGrant.conditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
          <p>{citbGrant.howToClaim}</p>
        </section>

        <section className="funding__block" aria-labelledby="elcas">
          <h2 id="elcas">ELCAS for current and former forces</h2>
          <p>{elcas.summary} These include:</p>
          <ul className="ticks">
            {elcasNvqs.map((nvq) => (
              <li key={nvq.slug}>
                <Link href={`/nvqs/${nvq.slug}`}>
                  Level {nvq.level} {nvq.name}
                </Link>
              </li>
            ))}
            <li>Level 6 Occupational Health and Safety</li>
          </ul>
        </section>

        <section className="funding__block" aria-labelledby="bulk">
          <h2 id="bulk">Training {bulkBooking.minimumPlaces} or more people</h2>
          <p>{bulkBooking.summary}</p>
          <p>
            Add the places to your basket and a coordinator calls to confirm the discount, or <Link href="/contact">get in touch</Link>.
          </p>
        </section>

        <section className="funding__block funding__block--wide" aria-labelledby="pay">
          <h2 id="pay">Paying for an NVQ</h2>
          <p>Here’s how the four options work out for a Level 3 NVQ at {formatGBP(1100)} + VAT. Each NVQ page shows its own figures.</p>
          <PaymentPlans price={1100} />
        </section>
      </div>
    </>
  );
}
