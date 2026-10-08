import type { Metadata } from 'next';
import { BasketView } from '@/components/checkout/BasketView';

export const metadata: Metadata = {
  title: 'Basket',
};

export default function BasketPage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">Basket</h1>
          <p className="page-head__lede">Prices are per place. A coordinator confirms dates and joining instructions after you book.</p>
        </div>
      </header>
      <section className="section section--tight">
        <div className="container">
          <BasketView />
        </div>
      </section>
    </>
  );
}
