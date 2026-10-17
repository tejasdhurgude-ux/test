import { products } from '../data/products';
import { searchProducts } from './searchProducts';

const names = (q: string) => searchProducts(products, q).map((p) => p.name);

describe('searchProducts', () => {
  it('returns every product for an empty or whitespace query', () => {
    expect(searchProducts(products, '')).toHaveLength(10);
    expect(searchProducts(products, '   ')).toHaveLength(10);
  });
  it('is case-insensitive', () => {
    expect(names('SKY')).toEqual(names('sky'));
    expect(names('sky')).toHaveLength(3);
  });
  it.each([
    ['NSV', 3],
    ['3.5', 2],
    ['Mukila', 4],
    ['mal', 5],
  ])('"%s" returns %i products', (q, count) => expect(names(q)).toHaveLength(count));
  it.each([
    ['vertex', 'Sky Shot NSV 3.5 inch vertex'],
    ['Taisho', 'Sky Shot NSV 3.5 inch Taisho'],
    ['10K', 'Mukila 10K mal'],
    ['25', 'Anil Man Pasand 25 shot'],
    ['Peacock', 'Peacock'],
    ['Velvalli', "2000 Velvalli's Mal"],
  ])('"%s" returns only %s', (q, name) => expect(names(q)).toEqual([name]));
  it('includes Velvalli and Mukila for "Mal"', () => {
    expect(names('Mal')).toContain("2000 Velvalli's Mal");
    expect(names('Mal')).toContain('Mukila 10K mal');
  });
  it('uses AND semantics across tokens', () => {
    expect(names('sky vertex')).toEqual(['Sky Shot NSV 3.5 inch vertex']);
    expect(names('sky taisho')).toEqual(['Sky Shot NSV 3.5 inch Taisho']);
    expect(names('sky peacock')).toEqual([]);
  });
  it('ignores extra whitespace and searches packaging', () => {
    expect(names('  sky    vertex  ')).toHaveLength(1);
    expect(names('pieces')).toHaveLength(3);
  });
});
