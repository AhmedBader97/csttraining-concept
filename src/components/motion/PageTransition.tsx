'use client';

import { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// Module scope survives client-side navigations, so only the first load skips the animation.
let hasNavigated = false;

/**
 * Fades each new page in on client-side navigation and runs the page's scroll
 * reveals. The first load renders without animation so it never delays
 * Largest Contentful Paint.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate] = useState(() => hasNavigated);
  useScrollReveal(ref);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <div ref={ref} className={animate ? 'page-transition page-transition--animate' : 'page-transition'}>
      {children}
    </div>
  );
}
