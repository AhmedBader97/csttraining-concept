/** Concept metadata: who built this and where the real site lives. */
export const concept = {
  author: 'Ahmed Bader',
  email: 'bader97@hotmail.co.uk',
  role: 'Junior Frontend Developer applicant',
  repoUrl: 'https://github.com/AhmedBader97/csttraining-concept',
  originalSite: 'https://www.csttraining.co.uk',
  links: [
    { label: 'GitHub', href: 'https://github.com/AhmedBader97' },
    { label: 'Timelex', href: 'https://timelex.ai' },
  ],
} as const;

export const mainNav = [
  { href: '/courses', label: 'Courses' },
  { href: '/nvqs', label: 'NVQs' },
  { href: '/cscs-cards', label: 'CSCS cards' },
  { href: '/funding', label: 'Funding' },
  { href: '/venues', label: 'Venues' },
  { href: '/compliance', label: 'For employers' },
] as const;
