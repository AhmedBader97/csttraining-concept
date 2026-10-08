'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useState } from 'react';
import { CardChip } from '@/components/shared/CardChip';
import { nvqGroups, nvqs, shortCardLabel, type Nvq, type NvqGroup } from '@/content/nvqs';
import { formatGBP } from '@/lib/pricing';

const groups = Object.keys(nvqGroups) as NvqGroup[];

interface TradeRow {
  name: string;
  levels: Nvq[];
}

/** Trade NVQs are listed once per trade, with each level side by side. */
function byTrade(list: Nvq[]): TradeRow[] {
  const rows = new Map<string, Nvq[]>();
  for (const nvq of list) rows.set(nvq.name, [...(rows.get(nvq.name) ?? []), nvq]);
  return Array.from(rows, ([name, levels]) => ({ name, levels: levels.sort((a, b) => a.level - b.level) })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function NvqFinder() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initialGroup = params.get('group') as NvqGroup | null;
  const [group, setGroup] = useState<NvqGroup>(initialGroup && groups.includes(initialGroup) ? initialGroup : 'trade');
  const [level, setLevel] = useState<number | null>(params.get('level') ? Number(params.get('level')) : null);
  const [query, setQuery] = useState(params.get('q') ?? '');
  const searchId = useId();

  useEffect(() => {
    const next = new URLSearchParams();
    if (group !== 'trade') next.set('group', group);
    if (level) next.set('level', String(level));
    if (query.trim()) next.set('q', query.trim());
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }, [group, level, query, pathname, router]);

  const inGroup = useMemo(() => nvqs.filter((nvq) => nvq.group === group), [group]);
  const levels = useMemo(() => Array.from(new Set(inGroup.map((nvq) => nvq.level))).sort(), [inGroup]);
  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return inGroup
      .filter((nvq) => level == null || nvq.level === level)
      .filter((nvq) => words.every((word) => `${nvq.name} ${nvq.pathways ?? ''}`.toLowerCase().includes(word)));
  }, [inGroup, level, query]);

  const pickGroup = (next: NvqGroup) => {
    setGroup(next);
    setLevel(null);
  };

  return (
    <div className="nvq-finder">
      <div className="nvq-finder__tabs" role="group" aria-label="Kind of NVQ">
        {groups.map((value) => (
          <button key={value} type="button" className="nvq-tab" aria-pressed={group === value} onClick={() => pickGroup(value)}>
            <span className="nvq-tab__name">{nvqGroups[value].label}</span>
            <span className="nvq-tab__description">{nvqGroups[value].description}</span>
          </button>
        ))}
      </div>

      <div className="nvq-finder__controls">
        <div className="field">
          <label htmlFor={searchId} className="field__label">
            {group === 'trade' ? 'Find your trade' : 'Search'}
          </label>
          <input
            id={searchId}
            className="field__input"
            type="search"
            value={query}
            placeholder={group === 'trade' ? 'e.g. dry-lining, groundworks' : 'e.g. planning'}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {levels.length > 1 ? (
          <fieldset className="filter-group">
            <legend className="field__label">Level</legend>
            <div className="filter-group__options">
              <label className="filter-chip">
                <input type="radio" name="level" checked={level == null} onChange={() => setLevel(null)} />
                <span>All</span>
              </label>
              {levels.map((value) => (
                <label key={value} className="filter-chip">
                  <input type="radio" name="level" checked={level === value} onChange={() => setLevel(value)} />
                  <span>Level {value}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>

      <p className="catalogue__count" role="status">
        {shown.length === 1 ? '1 NVQ' : `${shown.length} NVQs`}
      </p>

      {shown.length === 0 ? (
        <div className="empty-state">
          <p>No {nvqGroups[group].label.toLowerCase()} match “{query}”. Call a coordinator: there are more pathways than are listed here.</p>
        </div>
      ) : group === 'trade' ? (
        <ul className="trade-list">
          {byTrade(shown).map((row) => (
            <li key={row.name} className="trade-list__row">
              <h2 className="trade-list__name">{row.name}</h2>
              <ul className="trade-list__levels">
                {row.levels.map((nvq) => (
                  <li key={nvq.slug}>
                    <Link href={`/nvqs/${nvq.slug}`} className="level-link">
                      <span className="level-link__level">Level {nvq.level}</span>
                      <span className="level-link__price">{formatGBP(nvq.price)} + VAT</span>
                      <CardChip colour={nvq.card.colour} label={shortCardLabel(nvq.card)} />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="course-ledger">
          {shown.map((nvq) => (
            <li key={nvq.slug} className="course-row">
              <div className="course-row__main">
                <h2 className="course-row__name">
                  <Link href={`/nvqs/${nvq.slug}`} className="course-row__link">
                    Level {nvq.level} NVQ in {nvq.name}
                  </Link>
                </h2>
                <p className="course-row__title">{nvq.pathways ?? `${nvq.duration}, completed remotely`}</p>
              </div>
              <p className="course-row__duration">{nvq.duration}</p>
              <div className="course-row__delivery">
                <CardChip colour={nvq.card.colour} label={nvq.card.label} />
              </div>
              <div className="course-row__price">
                <span className="price">
                  <span className="price__amount">
                    {formatGBP(nvq.price)}
                    <span className="price__plus"> + VAT</span>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
