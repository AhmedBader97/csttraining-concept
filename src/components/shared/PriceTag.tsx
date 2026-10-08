import { formatGBP, withVat } from '@/lib/pricing';

interface PriceTagProps {
  price: number | null;
  from?: boolean;
  was?: number;
  size?: 'small' | 'large';
}

/** Price before VAT, as the trade expects, with the VAT-inclusive figure underneath. */
export function PriceTag({ price, from, was, size = 'small' }: PriceTagProps) {
  if (price == null) {
    return (
      <span className={`price price--${size} price--request`}>
        <span className="price__amount">Price on request</span>
        <span className="price__vat">Confirmed by a coordinator</span>
      </span>
    );
  }
  return (
    <span className={`price price--${size}`}>
      {was ? (
        <span className="price__was">
          <span className="visually-hidden">Was </span>
          <s>{formatGBP(was)}</s>
        </span>
      ) : null}
      <span className="price__amount">
        {from ? <span className="price__from">From </span> : null}
        {formatGBP(price)}
        <span className="price__plus"> + VAT</span>
      </span>
      <span className="price__vat">{formatGBP(withVat(price))} with VAT</span>
    </span>
  );
}
