import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from './CheckoutForm';
import type { CartItem } from '../types/cart';

const items: CartItem[] = [{ productId: 'peacock', name: 'Peacock', packaging: '1 box', price: 250, quantity: 2 }];

function setup(onSubmit = vi.fn(() => Promise.resolve())) {
  render(<CheckoutForm items={items} billId="SYD-20260101-101010-ABCDEF" createdAt="2026-01-01T10:10:10Z" onSubmit={onSubmit} onBack={() => {}} />);
  return onSubmit;
}

describe('CheckoutForm', () => {
  it('shows validation errors and does not advance', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /review bill/i }));
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /confirm and save/i })).not.toBeInTheDocument();
  });

  it('submits only once even when confirm is clicked repeatedly', async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    setup(onSubmit);
    await userEvent.type(screen.getByLabelText(/customer name/i), 'Ravi');
    await userEvent.type(screen.getByLabelText(/customer phone/i), '9876543210');
    await userEvent.click(screen.getByRole('button', { name: /review bill/i }));
    const confirm = screen.getByRole('button', { name: /confirm and save/i });
    await userEvent.dblClick(confirm);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ravi', phone: '919876543210' });
    resolve();
  });

  it('offers a retry after a failed save', async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Server down.')).mockResolvedValueOnce(undefined);
    setup(onSubmit);
    await userEvent.type(screen.getByLabelText(/customer name/i), 'Ravi');
    await userEvent.type(screen.getByLabelText(/customer phone/i), '9876543210');
    await userEvent.click(screen.getByRole('button', { name: /review bill/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm and save/i }));
    expect(await screen.findByText(/server down/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /retry saving/i }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});
