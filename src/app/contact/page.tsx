import type { Metadata } from 'next';
import { company } from '@/content/company';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call a CST Training coordinator or find the office address.',
};

export default function ContactPage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">Talk to a training coordinator</h1>
          <p className="page-head__lede">
            Coordinators help with dates, funding, group bookings and which card or course you need. Calls are recorded for training and
            monitoring.
          </p>
        </div>
      </header>
      <section className="section section--tight">
        <div className="container contact">
          <div className="contact__block">
            <h2>Phone</h2>
            <a className="contact__phone" href={company.phoneHref}>
              {company.phone}
            </a>
          </div>
          <div className="contact__block">
            <h2>Registered office</h2>
            <address className="contact__address">
              {company.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </div>
          <div className="contact__block">
            <h2>Online</h2>
            <ul className="ticks">
              {company.social.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <aside className="contact__concept">
            <h2>About this page</h2>
            <p>
              This concept doesn’t send messages, so there’s no form here. To reach CST Training, call or use the{' '}
              <a href={company.contactUrl}>contact page on csttraining.co.uk</a>.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
