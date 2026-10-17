/**
 * Indian mobile numbers: 10 digits starting 6-9, optionally prefixed
 * with +91, 91 or 0. Returns 91XXXXXXXXXX or null when invalid.
 */
export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(digits)) return null;
  const plain = digits.replace(/^\+/, '');
  const match = /^(?:91|0)?([6-9]\d{9})$/.exec(plain);
  return match ? `91${match[1]}` : null;
}
