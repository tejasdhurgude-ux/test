import type { Product } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, quantityInCart, onAdd }: ProductCardProps) {
  return (
    <article className={`card product ${product.available ? '' : 'product--unavailable'}`}>
      <div>
        <h3 className="product__name">{product.name}</h3>
        <p className="product__pack">{product.packaging}</p>
      </div>
      <div className="product__foot">
        <div>
          <p className="product__price">{formatCurrency(product.price)}<span> / box</span></p>
          <p className={`status ${product.available ? 'status--ok' : 'status--off'}`}>
            {product.available ? 'Available' : 'Unavailable'}
          </p>
        </div>
        {product.available ? (
          <button type="button" className="btn btn--primary" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to cart`}>
            {quantityInCart > 0 ? `Add more (${quantityInCart})` : 'Add to cart'}
          </button>
        ) : (
          <button type="button" className="btn" disabled>Unavailable</button>
        )}
      </div>
    </article>
  );
}
