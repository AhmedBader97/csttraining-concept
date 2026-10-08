/** Form checks shared by checkout and the CSV import. Messages say what to fix. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

/**
 * UK phone numbers in any common format ("020 3488 4472", "+44 7700 900123",
 * "07700900123") to E.164 ("+442034884472"). Returns null if it isn't one.
 */
export function normaliseUkPhone(value: string): string | null {
  const digits = value.replace(/[\s().-]/g, '');
  let national: string;
  if (/^\+44\d+$/.test(digits)) national = digits.slice(3);
  else if (/^0044\d+$/.test(digits)) national = digits.slice(4);
  else if (/^0\d+$/.test(digits)) national = digits.slice(1);
  else return null;
  if (national.startsWith('0')) national = national.slice(1); // "+44 (0)20 ..."
  if (!/^[1-9]\d{8,9}$/.test(national)) return null;
  return `+44${national}`;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  /** The employer is registered with CITB, so may claim grants. */
  citbRegistered: boolean;
  notes: string;
}

export type CustomerErrors = Partial<Record<keyof CustomerDetails, string>>;

export function validateCustomer(details: CustomerDetails): CustomerErrors {
  const errors: CustomerErrors = {};
  if (!details.firstName.trim()) errors.firstName = 'Enter a first name.';
  if (!details.lastName.trim()) errors.lastName = 'Enter a last name.';
  if (!details.email.trim()) errors.email = 'Enter an email address.';
  else if (!isEmail(details.email)) errors.email = 'Enter an email address like name@company.co.uk.';
  if (!details.phone.trim()) errors.phone = 'Enter a phone number so a coordinator can call about dates.';
  else if (!normaliseUkPhone(details.phone)) errors.phone = 'Enter a UK phone number, like 020 3488 4472 or 07700 900123.';
  if (details.notes.length > 1000) errors.notes = 'Keep notes under 1,000 characters.';
  return errors;
}
