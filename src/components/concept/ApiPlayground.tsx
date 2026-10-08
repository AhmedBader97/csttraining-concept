'use client';

import { useId, useState } from 'react';

interface Preset {
  id: string;
  label: string;
  method: 'GET' | 'POST';
  url: string;
  /** GraphQL presets edit the query itself; it's wrapped in JSON when sent. */
  graphql?: boolean;
  body?: string;
}

const presets: Preset[] = [
  {
    id: 'gql-citb',
    label: 'GraphQL: CITB courses with VAT',
    method: 'POST',
    url: '/api/graphql',
    graphql: true,
    body: '{\n  courses(category: "citb") {\n    name\n    duration\n    price { net gross label }\n    refresher { name }\n  }\n}',
  },
  {
    id: 'gql-black',
    label: 'GraphQL: NVQs for the Black card',
    method: 'POST',
    url: '/api/graphql',
    graphql: true,
    body: '{\n  nvqs(group: MANAGEMENT) {\n    title\n    duration\n    price { label }\n    citbGrant\n  }\n}',
  },
  {
    id: 'rest-courses',
    label: 'REST: online courses',
    method: 'GET',
    url: '/api/courses?delivery=online',
  },
  {
    id: 'rest-quote',
    label: 'REST: price a basket',
    method: 'POST',
    url: '/api/quote',
    body: JSON.stringify({ items: [{ slug: 'smsts', places: 2 }, { slug: 'groundworks-level-2', places: 1 }] }, null, 2),
  },
];

/** Call the site's own APIs from the page and see exactly what comes back. */
export function ApiPlayground() {
  const [preset, setPreset] = useState<Preset>(presets[0]!);
  const [body, setBody] = useState(presets[0]!.body ?? '');
  const [result, setResult] = useState<{ status: number; ms: number; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const bodyId = useId();

  const choose = (next: Preset) => {
    setPreset(next);
    setBody(next.body ?? '');
    setResult(null);
  };

  const run = async () => {
    setBusy(true);
    const started = performance.now();
    try {
      const response = await fetch(preset.url, {
        method: preset.method,
        headers: preset.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: preset.method !== 'POST' ? undefined : preset.graphql ? JSON.stringify({ query: body }) : body,
      });
      const text = await response.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // Not JSON: show it as it came.
      }
      setResult({ status: response.status, ms: Math.round(performance.now() - started), text: pretty });
    } catch {
      setResult({ status: 0, ms: 0, text: 'The request didn’t reach the server. Check your connection and run it again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="playground">
      <div className="playground__presets" role="group" aria-label="Example requests">
        {presets.map((item) => (
          <button key={item.id} type="button" className="filter-chip filter-chip--button" aria-pressed={item.id === preset.id} onClick={() => choose(item)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="playground__request">
        <span className="inspector__method">{preset.method}</span> {preset.url}
      </p>
      {preset.method === 'POST' ? (
        <div className="field">
          <label htmlFor={bodyId} className="field__label">
            {preset.graphql ? 'GraphQL query (edit it)' : 'Request body (edit it)'}
          </label>
          <textarea id={bodyId} className="field__input playground__body" rows={8} spellCheck={false} value={body} onChange={(event) => setBody(event.target.value)} />
        </div>
      ) : null}
      <button type="button" className="button button--primary" onClick={run} disabled={busy}>
        {busy ? 'Sending…' : 'Send request'}
      </button>
      {result ? (
        <div className="playground__result" role="status">
          <p className="playground__status">
            {result.status ? `${result.status} in ${result.ms} ms` : 'No response'}
          </p>
          <pre className="inspector__code">
            <code>{result.text}</code>
          </pre>
        </div>
      ) : null}
    </div>
  );
}
