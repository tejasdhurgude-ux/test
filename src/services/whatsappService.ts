import type { Bill } from '../types/bill';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { lineTotal } from '../utils/calculations';

export function buildBillMessage(bill: Bill): string {
  const lines = bill.items.map(
    (item, i) =>
      `${i + 1}. ${item.name} (${item.packaging})\n    ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(lineTotal(item))}`,
  );
  return [
    '*Sahyadri Fireworks*',
    `Bill No: ${bill.billId}`,
    `Date: ${formatDateTime(bill.createdAt)}`,
    `Customer: ${bill.customer.name}`,
    '',
    ...lines,
    '',
    `*Total: ${formatCurrency(bill.total)}*`,
    '',
    'Thank you for shopping with us.',
  ].join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Opens WhatsApp with a prefilled message. The operator still has to press send. */
export function openWhatsApp(bill: Bill): boolean {
  const win = window.open(buildWhatsAppUrl(bill.customer.phone, buildBillMessage(bill)), '_blank', 'noopener,noreferrer');
  return win !== null;
}

export async function copyBillToClipboard(bill: Bill): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildBillMessage(bill));
    return true;
  } catch {
    return false;
  }
}
