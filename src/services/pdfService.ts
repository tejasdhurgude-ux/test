import type { Bill } from '../types/bill';
import { products } from '../data/products';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { lineTotal } from '../utils/calculations';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
const cell = 'padding:8px 6px;border-bottom:1px solid #dfe3dc;vertical-align:top;';

function buildBillHtml(bill: Bill): string {
  const rows = bill.items
    .map((item, i) => {
      const mr = products.find((p) => p.id === item.productId)?.nameMr ?? '';
      return `<tr>
        <td style="${cell}">${i + 1}</td>
        <td style="${cell}">
          <div style="font-weight:600">${esc(item.name)}</div>
          ${mr ? `<div>${esc(mr)}</div>` : ''}
          <div style="font-size:12px;color:#5b675f">${esc(item.packaging)}</div>
        </td>
        <td style="${cell}text-align:right">${item.quantity}</td>
        <td style="${cell}text-align:right">${formatCurrency(item.price)}</td>
        <td style="${cell}text-align:right">${formatCurrency(lineTotal(item))}</td>
      </tr>`;
    })
    .join('');

  return `<div style="font-family:'Noto Sans Devanagari',system-ui,sans-serif;color:#1b241e;padding:40px;font-size:14px;line-height:1.5">
    <div style="border-bottom:3px solid #14532d;padding-bottom:12px;margin-bottom:16px">
      <div style="font-size:26px;font-weight:600;color:#14532d">Sahyadri Fireworks</div>
      <div style="font-size:18px;color:#14532d">सह्याद्री फटाके</div>
    </div>
    <div>Bill No / बिल क्र.: <b>${esc(bill.billId)}</b></div>
    <div>Date / दिनांक: <b>${esc(formatDateTime(bill.createdAt))}</b></div>
    <div style="margin-bottom:16px">Customer / ग्राहक: <b>${esc(bill.customer.name)}</b> (+${esc(bill.customer.phone)})</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#e3f1e8;text-align:left">
        <th style="padding:8px 6px">#</th>
        <th style="padding:8px 6px">Item / वस्तू</th>
        <th style="padding:8px 6px;text-align:right">Qty / नग</th>
        <th style="padding:8px 6px;text-align:right">Rate / दर</th>
        <th style="padding:8px 6px;text-align:right">Amount / रक्कम</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="text-align:right;font-size:20px;font-weight:600;margin-top:16px;border-top:2px solid #14532d;padding-top:10px">
      Total / एकूण: ${formatCurrency(bill.total)}
    </div>
    <div style="margin-top:28px;text-align:center;color:#5b675f">Thank you! / धन्यवाद!</div>
  </div>`;
}

const fileName = (bill: Bill) => `Sahyadri-Bill-${bill.billId}.pdf`;

export async function generateBillPdf(bill: Bill): Promise<Blob> {
  // Loaded on demand so the main bundle stays small.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  await document.fonts.load('16px "Noto Sans Devanagari"', 'मराठी');
  await document.fonts.load('600 16px "Noto Sans Devanagari"', 'मराठी');

  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;';
  el.innerHTML = buildBillHtml(bill);
  document.body.appendChild(el);
  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const pageW = 210; // mm; page grows to fit long bills
    const contentH = (canvas.height / canvas.width) * pageW;
    const pdf = new jsPDF({ unit: 'mm', format: [pageW, Math.max(297, contentH)] });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, contentH);
    return pdf.output('blob');
  } finally {
    document.body.removeChild(el);
  }
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function downloadBillPdf(bill: Bill): Promise<void> {
  downloadBlob(await generateBillPdf(bill), fileName(bill));
}

export type PdfShareResult = 'shared' | 'downloaded' | 'cancelled';

/** Opens the phone's share sheet with the PDF; falls back to a download. */
export async function shareBillPdf(bill: Bill): Promise<PdfShareResult> {
  const blob = await generateBillPdf(bill);
  const file = new File([blob], fileName(bill), { type: 'application/pdf' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Sahyadri bill ${bill.billId}` });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }
  downloadBlob(blob, file.name);
  return 'downloaded';
}
