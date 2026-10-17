import type { CartItem } from '../types/cart';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { lineTotal } from '../utils/calculations';
import { BillSummary } from './BillSummary';

interface BillPreviewProps {
  billId: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
}

export function BillPreview({ billId, createdAt, customerName, customerPhone, items, subtotal, total }: BillPreviewProps) {
  return (
    <div className="preview">
      <div className="preview__meta">
        <p><strong>Bill ID</strong> {billId}</p>
        <p><strong>Date</strong> {formatDateTime(createdAt)}</p>
        {customerName && <p><strong>Customer</strong> {customerName}{customerPhone ? ` · +${customerPhone}` : ''}</p>}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Item</th><th className="num">Qty</th><th className="num">Unit price</th><th className="num">Amount</th></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.productId}>
                <td>{i.name}<span className="muted block">{i.packaging}</span></td>
                <td className="num">{i.quantity}</td>
                <td className="num">{formatCurrency(i.price)}</td>
                <td className="num">{formatCurrency(lineTotal(i))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BillSummary subtotal={subtotal} total={total} />
    </div>
  );
}
