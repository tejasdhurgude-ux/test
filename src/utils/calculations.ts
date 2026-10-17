import type { CartItem } from '../types/cart';

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function lineTotal(item: Pick<CartItem, 'price' | 'quantity'>): number {
  return round2(item.price * item.quantity);
}

export function calculateSubtotal(items: CartItem[]): number {
  return round2(items.reduce((sum, item) => sum + lineTotal(item), 0));
}

export function calculateTotal(items: CartItem[], discount = 0): number {
  return Math.max(0, round2(calculateSubtotal(items) - discount));
}

export function countUnits(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
