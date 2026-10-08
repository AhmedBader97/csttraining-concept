import type { Delivery } from '@/content/courses';
import { bulkBooking } from '@/content/funding';
import { round2, vatOn } from './pricing';

export interface BasketItem {
  /** Same course, delivery, venue and date share a line. */
  id: string;
  kind: 'course' | 'nvq';
  slug: string;
  name: string;
  /** Price per place before VAT; `null` when the price is on request. */
  unitPrice: number | null;
  places: number;
  delivery?: Delivery;
  venue?: string;
  /** ISO date of the first day. */
  date?: string;
}

export interface BasketState {
  items: BasketItem[];
}

export type BasketAction =
  | { type: 'add'; item: Omit<BasketItem, 'id' | 'places'> & { places?: number } }
  | { type: 'remove'; id: string }
  | { type: 'setPlaces'; id: string; places: number }
  | { type: 'clear' }
  | { type: 'restore'; state: BasketState };

export const MAX_PLACES = 50;

export const emptyBasket: BasketState = { items: [] };

export function lineId(item: Pick<BasketItem, 'slug' | 'delivery' | 'venue' | 'date'>): string {
  return [item.slug, item.delivery ?? '-', item.venue ?? '-', item.date ?? '-'].join('|');
}

function clampPlaces(places: number): number {
  if (!Number.isFinite(places)) return 1;
  return Math.min(MAX_PLACES, Math.max(1, Math.round(places)));
}

export function basketReducer(state: BasketState, action: BasketAction): BasketState {
  switch (action.type) {
    case 'add': {
      const id = lineId(action.item);
      const places = clampPlaces(action.item.places ?? 1);
      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        return {
          items: state.items.map((item) => (item.id === id ? { ...item, places: clampPlaces(item.places + places) } : item)),
        };
      }
      return { items: [...state.items, { ...action.item, id, places }] };
    }
    case 'remove':
      return { items: state.items.filter((item) => item.id !== action.id) };
    case 'setPlaces':
      return {
        items: state.items.map((item) => (item.id === action.id ? { ...item, places: clampPlaces(action.places) } : item)),
      };
    case 'clear':
      return emptyBasket;
    case 'restore':
      return isBasketState(action.state) ? action.state : state;
    default:
      return state;
  }
}

/** Guards data read back from storage, which could be anything. */
export function isBasketState(value: unknown): value is BasketState {
  if (!value || typeof value !== 'object' || !Array.isArray((value as BasketState).items)) return false;
  return (value as BasketState).items.every(
    (item) =>
      item &&
      typeof item.id === 'string' &&
      typeof item.slug === 'string' &&
      typeof item.name === 'string' &&
      (item.kind === 'course' || item.kind === 'nvq') &&
      (item.unitPrice === null || typeof item.unitPrice === 'number') &&
      typeof item.places === 'number',
  );
}

export interface BasketTotals {
  places: number;
  net: number;
  vat: number;
  gross: number;
  /** Lines without a published price: a coordinator confirms them. */
  linesOnRequest: number;
  /** 5 or more places qualifies for CST's bulk discount (agreed by a coordinator). */
  bulkEligible: boolean;
}

export function basketTotals(state: BasketState): BasketTotals {
  let net = 0;
  let places = 0;
  let linesOnRequest = 0;
  for (const item of state.items) {
    places += item.places;
    if (item.unitPrice == null) linesOnRequest += 1;
    else net += item.unitPrice * item.places;
  }
  net = round2(net);
  const vat = vatOn(net);
  return { places, net, vat, gross: round2(net + vat), linesOnRequest, bulkEligible: places >= bulkBooking.minimumPlaces };
}
