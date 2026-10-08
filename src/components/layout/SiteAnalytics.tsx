'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { useEffect } from 'react';

const SKIP_KEY = 'concept:skip-analytics';

/** True when this browser has opted out of being counted (any page opened once with `?me`). */
function isOwner(): boolean {
  try {
    return new URLSearchParams(window.location.search).has('me') || window.localStorage.getItem(SKIP_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Anonymous, cookie-free page views through Vercel Web Analytics: which pages
 * were seen, when, and roughly where from, never who. Opening any page with
 * `?me` once stops this browser's own visits being counted.
 */
export function SiteAnalytics() {
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).has('me')) window.localStorage.setItem(SKIP_KEY, '1');
    } catch {
      // Storage blocked: the ?me visit itself is still skipped below.
    }
  }, []);

  return <Analytics beforeSend={(event: BeforeSendEvent) => (isOwner() ? null : event)} />;
}
