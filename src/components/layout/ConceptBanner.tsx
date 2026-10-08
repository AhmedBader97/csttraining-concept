import Link from 'next/link';
import { concept } from '@/config/site';

/** Always on screen: this is a concept, not CST Training's real site. */
export function ConceptBanner() {
  return (
    <aside className="concept-banner" aria-label="About this website">
      <div className="container concept-banner__inner">
        <p className="concept-banner__text">
          <strong>Unofficial redesign concept</strong> by {concept.author}. Not affiliated with CST Training
          <span className="concept-banner__extra">, and nothing you enter is sent anywhere</span>.
        </p>
        <Link href="/how-it-was-built" className="concept-banner__link">
          How it was built
        </Link>
      </div>
    </aside>
  );
}
