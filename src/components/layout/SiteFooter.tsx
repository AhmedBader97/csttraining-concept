import Link from 'next/link';
import { concept } from '@/config/site';
import { company } from '@/content/company';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <section className="site-footer__col" aria-labelledby="footer-contact">
          <h2 id="footer-contact" className="site-footer__title">
            Talk to a training coordinator
          </h2>
          <a className="site-footer__phone" href={company.phoneHref}>
            {company.phone}
          </a>
          <address className="site-footer__address">
            {company.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        </section>

        <nav className="site-footer__col" aria-labelledby="footer-courses">
          <h2 id="footer-courses" className="site-footer__title">
            Courses
          </h2>
          <ul className="site-footer__list">
            <li><Link href="/courses/smsts">SMSTS</Link></li>
            <li><Link href="/courses/sssts">SSSTS</Link></li>
            <li><Link href="/courses/hsa">HSA for the Green card</Link></li>
            <li><Link href="/nvqs">Construction NVQs</Link></li>
            <li><Link href="/cscs-cards">Which CSCS card?</Link></li>
          </ul>
        </nav>

        <nav className="site-footer__col" aria-labelledby="footer-help">
          <h2 id="footer-help" className="site-footer__title">
            Help
          </h2>
          <ul className="site-footer__list">
            <li><Link href="/funding">CITB grants and payment plans</Link></li>
            <li><Link href="/venues">Venues</Link></li>
            <li><Link href="/compliance">For employers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>

        <section className="site-footer__col" aria-labelledby="footer-concept">
          <h2 id="footer-concept" className="site-footer__title">
            About this concept
          </h2>
          <p>
            Built by {concept.author} as part of a Junior Frontend Developer application. Course details come from{' '}
            <a href={concept.originalSite}>csttraining.co.uk</a>.
          </p>
          <ul className="site-footer__list">
            <li><Link href="/how-it-was-built">How it was built</Link></li>
            <li><a href={concept.repoUrl}>Code on GitHub</a></li>
          </ul>
        </section>
      </div>
      <div className="container site-footer__legal">
        <p>
          {company.legalName}. Registered in England and Wales, company number {company.companyNumber}. VAT number{' '}
          {company.vatNumber}. Prices exclude VAT at 20% unless shown otherwise.
        </p>
        <p>{company.prince2Notice}</p>
      </div>
    </footer>
  );
}
