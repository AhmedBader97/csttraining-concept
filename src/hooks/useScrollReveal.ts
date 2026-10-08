import { type RefObject, useLayoutEffect } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

const SETTLE_MS = 1800; // longest reveal (900ms) plus the last stagger step, with room to spare

/**
 * Scroll reveals for everything marked `data-reveal` inside `ref`:
 * `data-reveal` fades an element up, `data-reveal="group"` staggers its children.
 *
 * Server HTML is fully visible. Before the browser paints, this marks anything
 * already on screen as revealed (so it is never hidden), and only then hides
 * the rest until it scrolls into view. Once an element has settled it drops the
 * reveal styles, so its own hover transitions work as normal. Without
 * JavaScript, or with reduced motion, nothing is ever hidden.
 *
 * Content that arrives later is picked up too. That matters because the
 * template above stays mounted when navigating within a section (/jobs/x to
 * /jobs), so the new page reaches this root as added nodes, not a fresh mount.
 */
export function useScrollReveal(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const settling = new Set<HTMLElement>();
    let active = true;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.dataset.revealed = 'true';
          settling.add(el);
          const timer = setTimeout(() => {
            el.dataset.revealed = 'done';
            settling.delete(el);
            timers.delete(timer);
          }, SETTLE_MS);
          timers.add(timer);
        }
      },
      // Any height works: reveal as soon as the top edge is a little way into the viewport
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );

    const track = (el: HTMLElement) => {
      if (el.dataset.revealed) return;
      // Anything with even a sliver in the viewport is shown as it is; only content fully below waits.
      if (el.getBoundingClientRect().top < window.innerHeight) el.dataset.revealed = 'instant';
      else io.observe(el);
    };
    const scan = (node: Element) => {
      if (node.matches('[data-reveal]')) track(node as HTMLElement);
      node.querySelectorAll<HTMLElement>('[data-reveal]').forEach(track);
    };

    // New pages and late content arrive as added nodes; removed ones stop being watched.
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => node instanceof Element && scan(node));
        record.removedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('[data-reveal]')) io.unobserve(node);
          node.querySelectorAll('[data-reveal]').forEach((el) => io.unobserve(el));
        });
      }
    });
    mo.observe(root, { childList: true, subtree: true });

    // Measure once the router has finished this commit (it resets the scroll position in a
    // parent's layout effect), but still before the browser paints.
    queueMicrotask(() => {
      if (!active) return;
      scan(root);
      root.classList.add('js-reveal');
    });

    return () => {
      active = false;
      mo.disconnect();
      io.disconnect();
      timers.forEach(clearTimeout);
      settling.forEach((el) => (el.dataset.revealed = 'done'));
    };
  }, [ref]);
}
