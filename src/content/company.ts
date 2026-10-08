/**
 * Company facts, as published on csttraining.co.uk (October 2026).
 */
export const company = {
  name: 'CST Training',
  legalName: 'CST Training LTD',
  phone: '020 3488 4472',
  phoneHref: 'tel:+442034884472',
  address: ['River House', 'Bexley High Street', 'Bexley, Kent', 'DA5 1JX'],
  companyNumber: '12052513',
  vatNumber: '349 5015 92',
  vatRate: 0.2,
  site: 'https://www.csttraining.co.uk',
  reviewsUrl: 'https://www.csttraining.co.uk/reviews/',
  contactUrl: 'https://www.csttraining.co.uk/contact/',
  complianceUrl: 'https://www.csttraining.co.uk/compliance-control/',
  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/CSTtraining/' },
    { label: 'Instagram', href: 'https://www.instagram.com/cst_training/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/42338308/' },
  ],
  /** "We are a fully approved … training provider" claims from the homepage. */
  approvedBy: ['CITB', 'NEBOSH', 'Highfield', 'ISEP'],
  /** Other awarding bodies whose courses are on the site. */
  alsoOffering: ['IOSH', 'PRINCE2®', 'CMI', 'ILM', 'EUSR'],
  classroomLocations: '30+',
  prince2Notice: 'PRINCE2® is a registered trade mark of PeopleCert group. Used under licence from PeopleCert. All rights reserved.',
} as const;
