import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddNvqToBasket } from '@/components/basket/AddNvqToBasket';
import { PaymentPlans } from '@/components/nvqs/PaymentPlans';
import { CardChip } from '@/components/shared/CardChip';
import { PriceTag } from '@/components/shared/PriceTag';
import { citbGrant, elcas } from '@/content/funding';
import { getNvq, nvqFacts, nvqGroups, nvqProcess, nvqs, nvqTitle } from '@/content/nvqs';
import { formatGBP } from '@/lib/pricing';

export function generateStaticParams() {
  return nvqs.map((nvq) => ({ slug: nvq.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const nvq = getNvq((await params).slug);
  return nvq ? { title: nvqTitle(nvq), description: `${nvqTitle(nvq)}: ${formatGBP(nvq.price)} + VAT, ${nvq.duration}, leads to the ${nvq.card.label}.` } : {};
}

export default async function NvqPage({ params }: { params: Promise<{ slug: string }> }) {
  const nvq = getNvq((await params).slug);
  if (!nvq) notFound();
  const otherLevels = nvqs.filter((other) => other.group === nvq.group && other.name === nvq.name && other.slug !== nvq.slug);
  const testName = nvq.card.colour === 'black' ? 'CITB MAP test' : 'CITB HS&E test';

  return (
    <>
      <header className="page-head course-head">
        <div className="container course-head__grid">
          <div>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li><Link href="/nvqs">NVQs</Link></li>
                <li><Link href={`/nvqs?group=${nvq.group}`}>{nvqGroups[nvq.group].label}</Link></li>
                <li aria-current="page">Level {nvq.level}</li>
              </ol>
            </nav>
            <h1 className="page-head__title">{nvqTitle(nvq)}</h1>
            <p className="page-head__lede">
              Completed remotely in {nvq.duration}, using evidence from your own work.
              {nvq.pathways ? ` ${nvq.pathways}.` : ''}
            </p>
            <p className="nvq-head__card">
              Leads to the <CardChip colour={nvq.card.colour} label={nvq.card.label} />
            </p>
          </div>
          <div className="course-head__price">
            <PriceTag price={nvq.price} size="large" />
          </div>
        </div>
      </header>

      <div className="container course-body">
        <div className="course-body__main">
          <section className="course-section" aria-labelledby="how">
            <h2 id="how">How it works</h2>
            <ol className="steps">
              {nvqProcess.map((step) => (
                <li key={step} className="steps__item">
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="course-section" aria-labelledby="card">
            <h2 id="card">Getting your card</h2>
            <p>
              When you’ve finished, pass the {testName} and apply for the {nvq.card.label}.
              {nvq.group !== 'trade' ? ' You can apply for a temporary card as soon as you enrol.' : ''}
            </p>
          </section>

          <section className="course-section" aria-labelledby="facts">
            <h2 id="facts">Good to know</h2>
            <ul className="ticks">
              {nvqFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
              <li>
                {nvq.noCitbGrant
                  ? 'The CITB achievement grant doesn’t cover Level 7 management NVQs.'
                  : `CITB-registered employers can claim ${formatGBP(citbGrant.amount)} when you achieve it.`}
              </li>
              {nvq.elcas ? <li>{elcas.summary}</li> : null}
            </ul>
          </section>

          {otherLevels.length ? (
            <p className="course-source">
              Also available:{' '}
              {otherLevels.map((other) => (
                <Link key={other.slug} href={`/nvqs/${other.slug}`}>
                  Level {other.level} ({formatGBP(other.price)} + VAT)
                </Link>
              ))}
            </p>
          ) : null}
        </div>

        <aside className="course-body__aside">
          <div className="booking">
            <h2 className="booking__title">Enrol</h2>
            <PaymentPlans price={nvq.price} />
            <AddNvqToBasket slug={nvq.slug} name={nvqTitle(nvq)} price={nvq.price} />
          </div>
        </aside>
      </div>
    </>
  );
}
