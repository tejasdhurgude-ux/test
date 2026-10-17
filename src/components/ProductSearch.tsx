interface ProductSearchProps {
  query: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

export function ProductSearch({ query, onChange, resultCount, totalCount }: ProductSearchProps) {
  return (
    <div className="search">
      <label htmlFor="product-search" className="field__label">Search products</label>
      <input
        id="product-search"
        type="search"
        className="input"
        placeholder="Try “sky”, “3.5”, “mukila 10k”"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      <p className="search__count" role="status">
        {resultCount === totalCount ? `${totalCount} products` : `${resultCount} of ${totalCount} products`}
      </p>
    </div>
  );
}
