import { useState } from 'react';
import { products } from '../data/products';
import { searchProducts } from '../utils/searchProducts';
import { generateBillId } from '../utils/billId';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { getIdToken, logOut } from '../services/authService';
import { submitBill } from '../services/billingService';
import type { Bill, CustomerDetails } from '../types/bill';
import { Header } from '../components/Header';
import { ProductSearch } from '../components/ProductSearch';
import { ProductGrid } from '../components/ProductGrid';
import { Cart } from '../components/Cart';
import { CheckoutForm } from '../components/CheckoutForm';
import { SavedBill } from '../components/SavedBill';

type Stage = 'shopping' | 'checkout' | 'saved';

export function BillingPage() {
  const { user } = useAuth();
  const { items, dispatch, unitCount } = useCart();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<Stage>('shopping');
  // Created once per bill and reused on retries so the server can de-duplicate.
  const [draft, setDraft] = useState(() => ({ billId: generateBillId(), createdAt: new Date().toISOString() }));
  const [saved, setSaved] = useState<{ bill: Bill; duplicate: boolean } | null>(null);

  // Derived, not stored.
  const visible = searchProducts(products, query);

  function startCheckout() {
    setDraft({ billId: generateBillId(), createdAt: new Date().toISOString() });
    setStage('checkout');
  }

  async function handleSubmit(customer: CustomerDetails) {
    const token = await getIdToken();
    const result = await submitBill(
      { billId: draft.billId, customer, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
      token,
    );
    setSaved({
      duplicate: result.duplicate,
      bill: {
        billId: result.billId,
        createdAt: draft.createdAt,
        customer,
        items,
        subtotal: result.subtotal,
        discount: 0,
        total: result.total, // server-calculated amount is authoritative
        staffEmail: user?.email ?? '',
      },
    });
    dispatch({ type: 'clear' });
    setStage('saved');
  }

  function newBill() {
    setSaved(null);
    setQuery('');
    setStage('shopping');
  }

  return (
    <div className="app">
      <Header userEmail={user?.email ?? 'Dev mode (no login)'} cartCount={unitCount} onLogout={() => { dispatch({ type: 'clear' }); void logOut(); }} />
      <main className="layout">
        <section className="catalogue" aria-label="Product catalogue">
          <ProductSearch query={query} onChange={setQuery} resultCount={visible.length} totalCount={products.length} />
          <ProductGrid products={visible} cartItems={items} onAdd={(product) => dispatch({ type: 'add', product })} />
        </section>
        <aside className="sidebar">
          {stage === 'shopping' && <Cart onCheckout={startCheckout} />}
          {stage === 'checkout' && (
            <CheckoutForm items={items} billId={draft.billId} createdAt={draft.createdAt} onSubmit={handleSubmit} onBack={() => setStage('shopping')} />
          )}
          {stage === 'saved' && saved && <SavedBill bill={saved.bill} duplicate={saved.duplicate} onNewBill={newBill} />}
        </aside>
      </main>
    </div>
  );
}
