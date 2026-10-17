import { calculateSubtotal, calculateTotal, countUnits } from './calculations';
import { formatCurrency } from './formatCurrency';
import type { CartItem } from '../types/cart';

const item = (price: number, quantity: number, id = 'a'): CartItem => ({ productId: id, name: id, packaging: '', price, quantity });

describe('calculations', () => {
  it('sums line totals', () => {
    const items = [item(1500, 2, 'a'), item(250, 3, 'b')];
    expect(calculateSubtotal(items)).toBe(3750);
    expect(calculateTotal(items)).toBe(3750);
    expect(countUnits(items)).toBe(5);
  });
  it('handles an empty cart', () => expect(calculateTotal([])).toBe(0));
  it('formats INR with Indian grouping', () => {
    expect(formatCurrency(1500)).toBe('₹1,500');
    expect(formatCurrency(150000)).toBe('₹1,50,000');
  });
});
