'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useBasket } from './BasketProvider';

/** NVQs start when you enrol, so there's no date to choose. */
export function AddNvqToBasket({ slug, name, price }: { slug: string; name: string; price: number }) {
  const { add } = useBasket();
  const [added, setAdded] = useState(false);
  return (
    <div className="add-nvq">
      <button
        type="button"
        className="button button--primary button--block"
        onClick={() => {
          add({ kind: 'nvq', slug, name, unitPrice: price, delivery: 'online' });
          setAdded(true);
        }}
      >
        Enrol: add to basket
      </button>
      <p className="booking__added" role="status">
        {added ? (
          <>
            Added. <Link href="/basket">Go to your basket</Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
