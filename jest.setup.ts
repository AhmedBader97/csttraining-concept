import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';
import { toHaveNoViolations } from 'jest-axe';

// jsdom leaves these out; sql.js needs them to read query results.
if (typeof globalThis.TextDecoder === 'undefined') {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
}

expect.extend(toHaveNoViolations);

if (typeof window !== 'undefined') {
  // jsdom doesn't implement matchMedia; components read it for reduced motion.
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  // Report every observed element as visible straight away.
  class MockIntersectionObserver {
    private callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      this.callback([{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: MockIntersectionObserver });
  Object.defineProperty(globalThis, 'IntersectionObserver', { writable: true, value: MockIntersectionObserver });

  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'ResizeObserver', { writable: true, value: MockResizeObserver });
  Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: MockResizeObserver });

  // No canvas in jsdom: components must cope with a missing 2D context.
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { writable: true, value: () => null });
}
