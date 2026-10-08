'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useState } from 'react';
import { buildCatalogue, searchCatalogue } from '@/lib/catalogue';
import { priceLabel } from '@/lib/pricing';

const catalogue = buildCatalogue();
const suggestions = ['SMSTS', 'Green card', 'Bricklaying NVQ', 'First aid'];

/** Search with live results as you type. Enter, or the button, opens the full course list. */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const inputId = useId();
  const listId = useId();
  const results = useMemo(() => (query.trim().length >= 2 ? searchCatalogue(catalogue, query, 6) : []), [query]);
  const open = results.length > 0;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const chosen = active >= 0 ? results[active] : undefined;
    router.push(chosen ? chosen.href : `/courses?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => Math.min(results.length - 1, value + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => Math.max(-1, value - 1));
    } else if (event.key === 'Escape') {
      setQuery('');
      setActive(-1);
    }
  };

  return (
    <div className="hero-search">
      <form className="hero-search__form" role="search" onSubmit={submit}>
        <label htmlFor={inputId} className="hero-search__label">
          Search courses and NVQs
        </label>
        <div className="hero-search__row">
          <input
            id={inputId}
            className="hero-search__input"
            type="search"
            value={query}
            placeholder="Try “SSSTS” or “carpentry”"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
          />
          <button type="submit" className="button button--primary hero-search__button">
            Search
          </button>
        </div>
        <ul id={listId} className="hero-search__results" role="listbox" hidden={!open} aria-label="Matching courses and NVQs">
          {results.map((entry, index) => (
            <li key={entry.href} id={`${listId}-${index}`} role="option" aria-selected={index === active} className="hero-search__result">
              <Link href={entry.href} tabIndex={-1}>
                <span className="hero-search__result-title">{entry.title}</span>
                <span className="hero-search__result-meta">
                  {entry.group}, {priceLabel(entry)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </form>
      <p className="hero-search__popular">
        Popular:{' '}
        {suggestions.map((term, index) => (
          <span key={term}>
            <Link href={`/courses?q=${encodeURIComponent(term)}`}>{term}</Link>
            {index < suggestions.length - 1 ? ', ' : null}
          </span>
        ))}
      </p>
    </div>
  );
}
