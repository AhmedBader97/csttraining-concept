/** CST Training's permanent venues, from the Our Venues page (October 2026). */

export interface Venue {
  slug: string;
  city: string;
  region: string;
  name: string;
  address: string[];
  postcode: string;
  parking: string;
}

export const venues: Venue[] = [
  {
    slug: 'manchester-1',
    city: 'Manchester',
    region: 'North West',
    name: 'Manchester Venue 1',
    address: ['Unit 470 Broadstone Mill', 'Reddish, Stockport'],
    postcode: 'SK5 7DL',
    parking: 'Free parking on site',
  },
  {
    slug: 'manchester-2',
    city: 'Manchester',
    region: 'North West',
    name: 'Manchester Venue 2',
    address: ['Unit 471 Broadstone Mill', 'Reddish, Stockport'],
    postcode: 'SK5 7DL',
    parking: 'Free parking on site',
  },
  {
    slug: 'chelmsford',
    city: 'Chelmsford',
    region: 'East of England',
    name: 'Chelmsford Venue',
    address: ['Unit 25a Little Boyton Hall Farm', 'Boyton Cross, Chelmsford'],
    postcode: 'CM1 4LN',
    parking: 'Free parking on site',
  },
  {
    slug: 'birmingham',
    city: 'Birmingham',
    region: 'West Midlands',
    name: 'Birmingham Venue',
    address: ['Clinton House, High Street', 'Coleshill, Birmingham'],
    postcode: 'B46 3BP',
    parking: 'Free parking on site, more paid parking nearby',
  },
  {
    slug: 'milton-keynes',
    city: 'Milton Keynes',
    region: 'South East',
    name: 'Milton Keynes Venue',
    address: ['1 The Willows, Mill Farm Courtyard', 'Beachampton, Milton Keynes'],
    postcode: 'MK19 6DS',
    parking: 'Free parking on site',
  },
  {
    slug: 'leeds',
    city: 'Leeds',
    region: 'Yorkshire',
    name: 'Leeds Venue',
    address: ['Suite 5, First Floor, Wira Business Park', 'Ring Road, Leeds'],
    postcode: 'LS16 6EB',
    parking: 'Free parking on site',
  },
  {
    slug: 'newcastle',
    city: 'Newcastle',
    region: 'North East',
    name: 'Newcastle Venue',
    address: ['27 Kingsway House', 'Newcastle'],
    postcode: 'NE11 0HW',
    parking: 'Free parking on site',
  },
];

export function getVenue(slug: string): Venue | undefined {
  return venues.find((venue) => venue.slug === slug);
}
