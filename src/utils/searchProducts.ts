import type { Product } from '../types/product';

/** Lowercase, drop apostrophes, turn other punctuation into spaces (keeps "3.5"). */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();
}

function tokenise(text: string): string[] {
  return normalise(text)
    .split(' ')
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter(Boolean);
}

/**
 * Every query token must match the start of some word in name or packaging
 * (AND semantics). Empty query returns the full catalogue.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const queryTokens = tokenise(query);
  if (queryTokens.length === 0) return products;

  return products.filter((product) => {
    const words = tokenise(`${product.name} ${product.packaging}`);
    return queryTokens.every((token) => words.some((word) => word.startsWith(token)));
  });
}
