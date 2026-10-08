import { render, type RenderOptions } from '@testing-library/react';
import { BasketProvider, useBasket } from '@/components/basket/BasketProvider';

/** Renders inside the basket, as every page is. */
export function renderWithBasket(ui: React.ReactElement, options?: RenderOptions) {
  return render(<BasketProvider>{ui}</BasketProvider>, options);
}

/** Shows the basket's contents, so tests can check what was added. */
export function BasketProbe() {
  const { state, totals } = useBasket();
  return (
    <pre data-testid="basket">
      {JSON.stringify({ items: state.items.map(({ slug, places, unitPrice, delivery, venue, date }) => ({ slug, places, unitPrice, delivery, venue, date })), places: totals.places })}
    </pre>
  );
}

export function readBasket(element: HTMLElement) {
  return JSON.parse(element.textContent ?? '{}') as {
    items: Array<{ slug: string; places: number; unitPrice: number | null; delivery?: string; venue?: string; date?: string }>;
    places: number;
  };
}

/** A minimal fetch Response, since the test environment has no Response class. */
export function fakeResponse(body: unknown, status = 200) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return { ok: status >= 200 && status < 300, status, text: async () => text, json: async () => JSON.parse(text) };
}
