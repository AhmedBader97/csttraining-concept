import Link from 'next/link';
import { DeliveryList } from '@/components/shared/DeliveryList';
import { PriceTag } from '@/components/shared/PriceTag';
import type { CatalogueEntry } from '@/lib/catalogue';

/** One line of the course ledger: what it is, how long, how it's delivered, what it costs. */
export function CourseRow({ entry, headingLevel = 3 }: { entry: CatalogueEntry; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <li className="course-row">
      <div className="course-row__main">
        <Heading className="course-row__name">
          <Link href={entry.href} className="course-row__link">
            {entry.title}
          </Link>
        </Heading>
        <p className="course-row__title">{entry.subtitle}</p>
      </div>
      <p className="course-row__duration">{entry.duration}</p>
      <div className="course-row__delivery">
        <DeliveryList delivery={entry.delivery} />
      </div>
      <div className="course-row__price">
        <PriceTag price={entry.price} from={entry.priceFrom} />
      </div>
    </li>
  );
}
