import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';

export const MAX_QUANTITY = 999;

export type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'increment'; productId: string }
  | { type: 'decrement'; productId: string }
  | { type: 'remove'; productId: string }
  | { type: 'clear' };

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const { product } = action;
      if (!product.available) return state;
      const existing = state.find((i) => i.productId === product.id);
      if (existing) {
        return state.map((i) =>
          i.productId === product.id ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + 1) } : i,
        );
      }
      return [
        ...state,
        { productId: product.id, name: product.name, packaging: product.packaging, price: product.price, quantity: 1 },
      ];
    }
    case 'increment':
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + 1) } : i,
      );
    case 'decrement':
      // Never goes below 1; use "remove" to delete a line.
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i,
      );
    case 'remove':
      return state.filter((i) => i.productId !== action.productId);
    case 'clear':
      return [];
  }
}
