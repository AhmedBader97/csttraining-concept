import type { Metadata } from 'next';
import { company } from '@/content/company';
import { venues } from '@/content/venues';

export const metadata: Metadata = {
  title: 'Venues',
  description: 'CST Training’s permanent classroom venues, plus 30+ locations across the UK and live online courses.',
};

export default function VenuesPage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <h1 className="page-head__title">Venues</h1>
          <p className="page-head__lede">
            Classroom courses run at {company.classroomLocations} UK locations. These are the permanent venues, all with free parking. Every
            CITB course also runs live online, and at your own site for groups.
          </p>
        </div>
      </header>
      <section className="section section--tight">
        <div className="container">
          <ul className="venue-list">
            {venues.map((venue) => (
              <li key={venue.slug} className="venue">
                <h2 className="venue__city">{venue.city}</h2>
                <p className="venue__region">{venue.region}</p>
                <address className="venue__address">
                  {venue.address.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                  <span>{venue.postcode}</span>
                </address>
                <p className="venue__parking">{venue.parking}</p>
                <a className="venue__map" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.address.join(', ')}, ${venue.postcode}`)}`}>
                  Open in Google Maps
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
