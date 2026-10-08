import { basketReducer, basketTotals, emptyBasket, isBasketState, MAX_PLACES } from '../basket';

const smsts = { kind: 'course' as const, slug: 'smsts', name: 'SMSTS', unitPrice: 495, delivery: 'online' as const, date: '2026-11-02' };

describe('basket', () => {
  it('adds a line and merges the same course and date', () => {
    let state = basketReducer(emptyBasket, { type: 'add', item: smsts });
    state = basketReducer(state, { type: 'add', item: { ...smsts, places: 2 } });
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.places).toBe(3);
  });

  it('keeps different dates on separate lines', () => {
    let state = basketReducer(emptyBasket, { type: 'add', item: smsts });
    state = basketReducer(state, { type: 'add', item: { ...smsts, date: '2026-11-09' } });
    expect(state.items).toHaveLength(2);
  });

  it('keeps places between 1 and the maximum', () => {
    const state = basketReducer(emptyBasket, { type: 'add', item: smsts });
    const id = state.items[0]!.id;
    expect(basketReducer(state, { type: 'setPlaces', id, places: 0 }).items[0]?.places).toBe(1);
    expect(basketReducer(state, { type: 'setPlaces', id, places: 999 }).items[0]?.places).toBe(MAX_PLACES);
  });

  it('totals VAT, flags bulk bookings and prices on request', () => {
    let state = basketReducer(emptyBasket, { type: 'add', item: { ...smsts, places: 4 } });
    state = basketReducer(state, { type: 'add', item: { kind: 'course', slug: 'seats', name: 'SEATS', unitPrice: null } });
    const totals = basketTotals(state);
    expect(totals).toMatchObject({ places: 5, net: 1980, vat: 396, gross: 2376, linesOnRequest: 1, bulkEligible: true });
  });

  it('removes lines and clears', () => {
    const state = basketReducer(emptyBasket, { type: 'add', item: smsts });
    expect(basketReducer(state, { type: 'remove', id: state.items[0]!.id }).items).toEqual([]);
    expect(basketReducer(state, { type: 'clear' })).toEqual(emptyBasket);
  });

  it('ignores anything odd read back from storage', () => {
    expect(isBasketState({ items: [{ id: 1 }] })).toBe(false);
    expect(isBasketState('nonsense')).toBe(false);
    const state = basketReducer(emptyBasket, { type: 'add', item: smsts });
    expect(basketReducer(emptyBasket, { type: 'restore', state })).toEqual(state);
    expect(basketReducer(state, { type: 'restore', state: { items: 'x' } as never })).toBe(state);
  });
});
