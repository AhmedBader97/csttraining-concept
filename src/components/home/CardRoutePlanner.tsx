'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { cardRoutes, cardRulesNote } from '@/content/cards';
import type { CardColour } from '@/content/nvqs';
import { formatGBP } from '@/lib/pricing';

interface CardRoutePlannerProps {
  initial?: CardColour;
  /** The hero version is shorter; the CSCS cards page shows everything. */
  compact?: boolean;
}

/**
 * Pick a CSCS card and see the steps to get it, with what each step costs.
 * The cards are a radio group: arrow keys move between them.
 */
export function CardRoutePlanner({ initial = 'blue', compact = false }: CardRoutePlannerProps) {
  const [selected, setSelected] = useState<CardColour>(initial);
  const [dealt, setDealt] = useState(false);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const headingId = useId();
  const route = cardRoutes.find((item) => item.colour === selected) ?? cardRoutes[0]!;
  const index = cardRoutes.indexOf(route);

  // The one entrance animation on the page: the cards fan out from a stack.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDealt(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const choose = (next: number) => {
    const wrapped = (next + cardRoutes.length) % cardRoutes.length;
    setSelected(cardRoutes[wrapped]!.colour);
    buttons.current[wrapped]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      choose(index + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      choose(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      choose(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      choose(cardRoutes.length - 1);
    }
  };

  return (
    <div className={`route-planner${compact ? ' route-planner--compact' : ''}`}>
      <p id={headingId} className="route-planner__prompt">
        Which card are you going for?
      </p>
      <div
        className={`card-fan${dealt ? ' card-fan--dealt' : ''}`}
        role="radiogroup"
        aria-labelledby={headingId}
        onKeyDown={onKeyDown}
        data-selected={index}
      >
        {cardRoutes.map((card, position) => {
          const checked = card.colour === selected;
          return (
            <button
              key={card.colour}
              ref={(element) => {
                buttons.current[position] = element;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              className={`site-card site-card--${card.colour}`}
              data-side={position > index ? 'right' : 'left'}
              // Cards further from the chosen one sit lower in the stack, so neighbours stay visible.
              style={{ '--i': position, zIndex: checked ? 20 : 10 - Math.abs(position - index) } as React.CSSProperties}
              onClick={() => setSelected(card.colour)}
            >
              <span className="site-card__colour">{card.name}</span>
              <span className="site-card__role">{card.role}</span>
              <span className="site-card__chip" aria-hidden="true" />
              <span className="site-card__stripe" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <section className="route" aria-live="polite" aria-label={`Route to the ${route.name} card`}>
        <h2 className="route__title">
          The {route.name} card<span className="route__for">{route.forWho}</span>
        </h2>
        <ol className="route__steps">
          {route.steps.map((step) => (
            <li key={step.title} className="route__step">
              <span className="route__step-title">{step.title}</span>
              {!compact || step.href ? <span className="route__step-detail">{step.detail}</span> : null}
              {step.href ? (
                <Link className="route__link" href={step.href}>
                  {step.linkLabel}
                  {step.fromPrice ? `, from ${formatGBP(step.fromPrice)} + VAT` : ''}
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
        {route.note && !compact ? <p className="route__note">{route.note}</p> : null}
        <p className="route__rules">{cardRulesNote}</p>
      </section>
    </div>
  );
}
