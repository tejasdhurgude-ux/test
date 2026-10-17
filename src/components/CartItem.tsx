import type { CartItem as CartItemType } from '../types/cart';
import { formatCurrency } from '../utils/formatCurrency';
import { lineTotal } from '../utils/calculations';

interface CartItemProps {
  item: CartItemType;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  return (
    <li className="cart-item">
      <div className="cart-item__info">
        <p className="cart-item__name">{item.name}</p>
        <p className="muted">{item.packaging} · {formatCurrency(item.price)} each</p>
      </div>
      <div className="cart-item__controls">
        <div className="qty" role="group" aria-label={`Quantity for ${item.name}`}>
          <button type="button" className="qty__btn" onClick={() => onDecrement(item.productId)} disabled={item.quantity <= 1} aria-label={`Decrease quantity of ${item.name}`}>−</button>
          <span className="qty__value" aria-live="polite">{item.quantity}</span>
          <button type="button" className="qty__btn" onClick={() => onIncrement(item.productId)} aria-label={`Increase quantity of ${item.name}`}>+</button>
        </div>
        <p className="cart-item__total">{formatCurrency(lineTotal(item))}</p>
        <button type="button" className="link-btn" onClick={() => onRemove(item.productId)} aria-label={`Remove ${item.name}`}>Remove</button>
      </div>
    </li>
  );
}
