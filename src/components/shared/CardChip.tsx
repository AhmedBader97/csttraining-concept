import type { CardColour } from '@/content/nvqs';

/** A small swatch in a CSCS card colour, with the card's name for screen readers and sighted users alike. */
export function CardChip({ colour, label }: { colour: CardColour; label: string }) {
  return (
    <span className={`card-chip card-chip--${colour}`}>
      <span className="card-chip__swatch" aria-hidden="true" />
      {label}
    </span>
  );
}
