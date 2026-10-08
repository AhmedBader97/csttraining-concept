/** Grants, forces funding and payment plans, from CST Training's funding and NVQ pages (October 2026). */

export const citbGrant = {
  amount: 600,
  summary: 'CITB-registered employers can claim £600 for each NVQ an employee achieves.',
  conditions: [
    'Paid to employers registered with CITB and up to date with their levy returns.',
    'Small employers that are registered with CITB but don’t pay the levy can claim too.',
    'Paid to the employer, not to the employee.',
    'Not available for Level 7 management NVQs.',
  ],
  howToClaim: 'Send an enquiry and a CST advisor guides you through the application.',
} as const;

export const elcas = {
  summary: 'Current and former armed forces personnel may be able to use ELCAS funding for some NVQs.',
} as const;

export const bulkBooking = {
  minimumPlaces: 5,
  summary: 'Discounts on 5 or more courses, delivered online or at your site, with content tailored to your team.',
} as const;

export type PaymentPlanId = 'full' | 'half' | 'thirds' | 'finance';

export interface PaymentPlan {
  id: PaymentPlanId;
  label: string;
  description: string;
}

export const paymentPlans: PaymentPlan[] = [
  { id: 'full', label: 'Pay in full', description: '10% off. Can’t be combined with other offers.' },
  { id: 'half', label: '50/50', description: 'Half at the start, half on completion or after 6 months, whichever is first.' },
  {
    id: 'thirds',
    label: 'Three payments',
    description: 'A third at the start, a third after a month, a third on completion or after 6 months.',
  },
  { id: 'finance', label: '0% finance', description: 'Ten monthly payments by Direct Debit, no interest.' },
];
