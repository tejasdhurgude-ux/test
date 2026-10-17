import { formatCurrency } from '../utils/formatCurrency';

interface BillSummaryProps {
  subtotal: number;
  total: number;
}

export function BillSummary({ subtotal, total }: BillSummaryProps) {
  return (
    <dl className="summary">
      <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
      <div className="summary__total"><dt>Total</dt><dd data-testid="bill-total">{formatCurrency(total)}</dd></div>
    </dl>
  );
}
