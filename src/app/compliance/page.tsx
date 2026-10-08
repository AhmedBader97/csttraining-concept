import type { Metadata } from 'next';
import Link from 'next/link';
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard';
import { company } from '@/content/company';

export const metadata: Metadata = {
  title: 'For employers: Compliance Control',
  description: 'A working concept of CST’s Compliance Control: certificate expiry tracking, data checks and CSV import, on a made-up company.',
};

export default function CompliancePage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">See whose training runs out next</h1>
          <p className="page-head__lede">
            A working concept of CST’s <a href={company.complianceUrl}>Compliance Control</a>: every certificate’s expiry date, what to book
            now, and records that need tidying. It runs a real SQLite database in your browser. Booking a renewal puts the course straight in
            the basket.
          </p>
          <p className="page-head__aside">
            Training more than five people? <Link href="/funding">Bulk discounts and CITB grants</Link>.
          </p>
        </div>
      </header>
      <section className="section section--tight section--concrete">
        <div className="container">
          <ComplianceDashboard />
        </div>
      </section>
    </>
  );
}
