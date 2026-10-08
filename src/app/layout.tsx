import type { Metadata, Viewport } from 'next';
import '@/styles/main.scss';
import { BasketProvider } from '@/components/basket/BasketProvider';
import { ConceptBanner } from '@/components/layout/ConceptBanner';
import { SiteAnalytics } from '@/components/layout/SiteAnalytics';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { archivo } from './fonts';

export const metadata: Metadata = {
  title: {
    default: 'CST Training: CITB courses, NVQs and CSCS cards (redesign concept)',
    template: '%s | CST Training (redesign concept)',
  },
  description:
    'An unofficial redesign concept of csttraining.co.uk by Ahmed Bader: CSCS card routes, course booking, NVQs and a compliance dashboard, built with Next.js, GraphQL and REST.',
  // Unofficial concept: never index it.
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  authors: [{ name: 'Ahmed Bader' }],
};

export const viewport: Viewport = {
  themeColor: '#0e2238',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={archivo.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <BasketProvider>
          <ConceptBanner />
          <SiteHeader />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
        </BasketProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
