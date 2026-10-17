import { useCart } from '../hooks/useCart';
import { CartItem } from './CartItem';
import { BillSummary } from './BillSummary';

interface CartProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartProps) {
  const { items, dispatch, subtotal, total, unitCount } = useCart();

  return (
    <section id="cart" className="card cart" aria-labelledby="cart-title">
      <h2 id="cart-title" className="section-title">Cart <span className="muted">({unitCount})</span></h2>
      {items.length === 0 ? (
        <div className="empty empty--small">
          <p className="empty__title">Your cart is empty</p>
          <p>Add products from the catalogue to start a bill.</p>
        </div>
      ) : (
        <>
          <ul className="cart__list">
            {items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onIncrement={(id) => dispatch({ type: 'increment', productId: id })}
                onDecrement={(id) => dispatch({ type: 'decrement', productId: id })}
                onRemove={(id) => dispatch({ type: 'remove', productId: id })}
              />
            ))}
          </ul>
          <BillSummary subtotal={subtotal} total={total} />
          <button type="button" className="btn btn--primary btn--block" onClick={onCheckout}>Continue to checkout</button>
          <button type="button" className="link-btn" onClick={() => dispatch({ type: 'clear' })}>Clear cart</button>
        </>
      )}
    </section>
  );
}
