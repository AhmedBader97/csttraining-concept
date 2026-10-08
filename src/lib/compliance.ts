import { addDays, addYears } from './dates';

/**
 * Certificate rules for the Compliance Control concept. Validity periods are
 * the ones CST Training publishes (SMSTS, SSSTS and HSA: 5 years; First Aid
 * at Work: 3 years) plus the 5-year CSCS card.
 */

export type CertificateTypeId = 'cscs' | 'smsts' | 'sssts' | 'hsa' | 'first-aid';

export interface CertificateType {
  id: CertificateTypeId;
  label: string;
  validityYears: number;
  /** Course slug that renews it, if CST runs one. */
  renewWith: string | null;
}

export const certificateTypes: CertificateType[] = [
  { id: 'cscs', label: 'CSCS card', validityYears: 5, renewWith: null },
  { id: 'smsts', label: 'SMSTS', validityYears: 5, renewWith: 'smsts-refresher' },
  { id: 'sssts', label: 'SSSTS', validityYears: 5, renewWith: 'sssts-refresher' },
  { id: 'hsa', label: 'CITB HSA', validityYears: 5, renewWith: 'hsa' },
  { id: 'first-aid', label: 'First Aid at Work', validityYears: 3, renewWith: 'first-aid-at-work' },
];

export function getCertificateType(id: string): CertificateType | undefined {
  return certificateTypes.find((type) => type.id === id);
}

/** Matches the labels people use in spreadsheets: "SMSTS", "First aid", "CSCS". */
export function certificateTypeFromLabel(label: string): CertificateType | undefined {
  const key = label.trim().toLowerCase().replace(/[^a-z]/g, '');
  return certificateTypes.find((type) => {
    const id = type.id.replace(/[^a-z]/g, '');
    const name = type.label.toLowerCase().replace(/[^a-z]/g, '');
    return key === id || key === name || (key.length > 3 && name.startsWith(key));
  });
}

/** Certificates due within this many days count as "due". */
export const DUE_WINDOW_DAYS = 90;

export type ComplianceStatus = 'expired' | 'due' | 'valid';

export function expiryOf(achievedOn: string, validityYears: number): string {
  return addYears(achievedOn, validityYears);
}

export function statusOf(expiresOn: string, today: string): ComplianceStatus {
  if (expiresOn < today) return 'expired';
  if (expiresOn <= addDays(today, DUE_WINDOW_DAYS)) return 'due';
  return 'valid';
}

export const statusLabels: Record<ComplianceStatus, string> = {
  expired: 'Expired',
  due: `Due in ${DUE_WINDOW_DAYS} days`,
  valid: 'In date',
};
