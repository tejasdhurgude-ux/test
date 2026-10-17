import { createContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import type { CartItem } from '../types/cart';
import { cartReducer, type CartAction } from './cartReducer';
import { calculateSubtotal, calculateTotal, countUnits } from '../utils/calculations';

export interface CartContextValue {
  items: CartItem[];
  dispatch: Dispatch<CartAction>;
  subtotal: number;
  total: number;
  unitCount: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'sahyadri.cart.v1';

function loadInitial(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitial);

  // Survive an accidental refresh; cleared with the cart after a successful save.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: ignore */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      dispatch,
      subtotal: calculateSubtotal(items),
      total: calculateTotal(items),
      unitCount: countUnits(items),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
