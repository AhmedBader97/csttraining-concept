'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useState } from 'react';
import { categories, deliveryLabels, type CourseCategory, type Delivery } from '@/content/courses';
import { buildCatalogue, searchCatalogue, type CatalogueEntry } from '@/lib/catalogue';
import { CourseRow } from './CourseRow';

const nvqEntries = buildCatalogue().filter((entry) => entry.type === 'nvq');
const deliveryModes = Object.keys(deliveryLabels) as Delivery[];

interface CourseCatalogueProps {
  entries: Array<CatalogueEntry & { category: CourseCategory }>;
}

/**
 * Filter by type of course and how it's delivered, or search. The filters
 * live in the URL, so a filtered list can be shared or bookmarked.
 */
export function CourseCatalogue({ entries }: CourseCatalogueProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState<CourseCategory | 'all'>((params.get('category') as CourseCategory) ?? 'all');
  const [delivery, setDelivery] = useState<Delivery[]>(() => (params.get('delivery')?.split(',').filter(Boolean) as Delivery[]) ?? []);
  const searchId = useId();

  // Keep the URL in step without adding a history entry for every keystroke.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (category !== 'all') next.set('category', category);
    if (delivery.length) next.set('delivery', delivery.join(','));
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }, [query, category, delivery, pathname, router]);

  const results = useMemo(() => {
    const filtered = entries
      .filter((entry) => category === 'all' || entry.category === category)
      .filter((entry) => delivery.length === 0 || delivery.some((mode) => entry.delivery.includes(mode)));
    return searchCatalogue(filtered, query);
  }, [entries, category, delivery, query]);

  const nvqMatches = useMemo(() => (query.trim().length >= 3 ? searchCatalogue(nvqEntries, query) : []), [query]);

  const toggleDelivery = (mode: Delivery) =>
    setDelivery((current) => (current.includes(mode) ? current.filter((m) => m !== mode) : [...current, mode]));

  const reset = () => {
    setQuery('');
    setCategory('all');
    setDelivery([]);
  };

  return (
    <div className="catalogue">
      <div className="catalogue__filters">
        <div className="field">
          <label htmlFor={searchId} className="field__label">
            Search
          </label>
          <input
            id={searchId}
            className="field__input"
            type="search"
            value={query}
            placeholder="Course name, job or card"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <fieldset className="filter-group">
          <legend className="field__label">Type of course</legend>
          <div className="filter-group__options">
            {(['all', ...Object.keys(categories)] as Array<CourseCategory | 'all'>).map((value) => (
              <label key={value} className="filter-chip">
                <input type="radio" name="category" value={value} checked={category === value} onChange={() => setCategory(value)} />
                <span>{value === 'all' ? 'All' : categories[value].label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-group">
          <legend className="field__label">Delivered</legend>
          <div className="filter-group__options">
            {deliveryModes.map((mode) => (
              <label key={mode} className="filter-chip">
                <input type="checkbox" checked={delivery.includes(mode)} onChange={() => toggleDelivery(mode)} />
                <span>{deliveryLabels[mode]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="catalogue__results">
        <p className="catalogue__count" role="status">
          {results.length === 1 ? '1 course' : `${results.length} courses`}
          {query.trim() ? ` for “${query.trim()}”` : ''}
        </p>
        {results.length ? (
          <ul className="course-ledger">
            {results.map((entry) => (
              <CourseRow key={entry.slug} entry={entry} headingLevel={2} />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No courses match those filters.</p>
            <button type="button" className="button button--secondary" onClick={reset}>
              Clear the filters
            </button>
          </div>
        )}
        {nvqMatches.length ? (
          <p className="catalogue__nvqs">
            {nvqMatches.length === 1 ? '1 NVQ also matches' : `${nvqMatches.length} NVQs also match`}.{' '}
            <Link href={`/nvqs?q=${encodeURIComponent(query.trim())}`}>See the NVQs</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
