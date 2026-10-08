import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NvqFinder } from '@/components/nvqs/NvqFinder';
import { nvqs } from '@/content/nvqs';

export const metadata: Metadata = {
  title: 'Construction NVQs',
  description: 'Trade, supervision and management NVQs from Level 2 to 7, completed remotely, with the CSCS card each one leads to.',
};

export default function NvqsPage() {
  const trades = new Set(nvqs.filter((n) => n.group === 'trade').map((n) => n.name)).size;
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">Construction NVQs</h1>
          <p className="page-head__lede">
            {nvqs.length} NVQs across {trades} trades, supervision and management. All done remotely with a dedicated assessor, and every one
            shows the card it lets you apply for.
          </p>
        </div>
      </header>
      <section className="section section--tight">
        <div className="container">
          <Suspense fallback={<p>Loading NVQs…</p>}>
            <NvqFinder />
          </Suspense>
        </div>
      </section>
    </>
  );
}
