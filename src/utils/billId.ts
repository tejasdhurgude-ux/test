const pad = (n: number) => String(n).padStart(2, '0');
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Format: SYD-YYYYMMDD-HHMMSS-XXXXXX. Generated once per bill and reused on retries. */
export function generateBillId(now: Date = new Date()): string {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `SYD-${date}-${time}-${suffix}`;
}
