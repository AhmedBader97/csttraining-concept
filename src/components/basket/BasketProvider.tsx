'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { basketReducer, basketTotals, emptyBasket, type BasketAction, type BasketItem, type BasketState, type BasketTotals } from '@/lib/basket';

const STORAGE_KEY = 'cst-concept:basket';

interface BasketContextValue {
  state: BasketState;
  totals: BasketTotals;
  dispatch: (action: BasketAction) => void;
  add: (item: Omit<BasketItem, 'id' | 'places'> & { places?: number }) => void;
  /** The last line added, for the "Added to your basket" message. */
  lastAdded: string | null;
}

const BasketContext = createContext<BasketContextValue | null>(null);

/**
 * The basket lives in React state and is copied to localStorage, so it
 * survives a refresh. Storage can be blocked (private windows), so every
 * read and write is guarded and the basket still works without it.
 */
export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(basketReducer, emptyBasket);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  // Becomes true in the same render as the restored basket, so the empty
  // starting basket is never written over what was saved.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: 'restore', state: JSON.parse(saved) as BasketState });
    } catch {
      // Unreadable or blocked storage: start with an empty basket.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: the basket still works for this visit.
    }
  }, [state, hydrated]);

  const add = useCallback<BasketContextValue['add']>((item) => {
    dispatch({ type: 'add', item });
    setLastAdded(item.name);
  }, []);

  const value = useMemo(() => ({ state, totals: basketTotals(state), dispatch, add, lastAdded }), [state, add, lastAdded]);
  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketContextValue {
  const context = useContext(BasketContext);
  if (!context) throw new Error('useBasket must be used inside <BasketProvider>');
  return context;
}
