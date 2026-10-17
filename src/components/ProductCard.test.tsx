import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';
import { products } from '../data/products';

describe('ProductCard', () => {
  it('adds an available product', async () => {
    const onAdd = vi.fn();
    render(<ProductCard product={products[0]} quantityInCart={0} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: /add sky shot nsv-4/i }));
    expect(onAdd).toHaveBeenCalledWith(products[0]);
  });
  it('disables unavailable products', () => {
    render(<ProductCard product={{ ...products[0], available: false }} quantityInCart={0} onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /unavailable/i })).toBeDisabled();
    expect(screen.getByText('Unavailable', { selector: 'p' })).toBeInTheDocument();
  });
});
