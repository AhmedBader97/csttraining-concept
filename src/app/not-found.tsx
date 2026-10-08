import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container prose">
        <h1>This page isn’t on site</h1>
        <p>The link may be old, or the course may have a new name.</p>
        <p>
          <Link href="/courses" className="button button--primary">
            Search the courses
          </Link>
        </p>
      </div>
    </section>
  );
}
