import { products } from '../data/products';
import { cartReducer } from './cartReducer';
import type { CartItem } from '../types/cart';

describe('cartReducer', () => {
  it('increments an existing line instead of duplicating it', () => {
    let state: CartItem[] = [];
    state = cartReducer(state, { type: 'add', product: products[0] });
    state = cartReducer(state, { type: 'add', product: products[0] });
    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(2);
  });
  it('never lets quantity drop below 1', () => {
    let state = cartReducer([], { type: 'add', product: products[0] });
    state = cartReducer(state, { type: 'decrement', productId: products[0].id });
    expect(state[0].quantity).toBe(1);
  });
  it('removes and clears lines', () => {
    let state = cartReducer([], { type: 'add', product: products[0] });
    state = cartReducer(state, { type: 'add', product: products[1] });
    state = cartReducer(state, { type: 'remove', productId: products[0].id });
    expect(state.map((i) => i.productId)).toEqual([products[1].id]);
    expect(cartReducer(state, { type: 'clear' })).toEqual([]);
  });
  it('rejects unavailable products', () => {
    const state = cartReducer([], { type: 'add', product: { ...products[0], available: false } });
    expect(state).toEqual([]);
  });
});
