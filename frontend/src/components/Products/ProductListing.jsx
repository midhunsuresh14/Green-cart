import React, { useMemo, useState } from 'react';
import './ProductListing.css';
import ProductCard from './ProductCard';
import { CATEGORY_TREE } from './categoriesData';
import { SAMPLE_PRODUCTS } from './productsData';
import { Link } from 'react-router-dom';

// Helper: flatten categories for quick sidebar rendering
const flatCategories = CATEGORY_TREE.map((cat) => ({
  key: cat.key,
  name: cat.name,
  children: cat.children || [],
}));

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'new', label: 'New Arrivals' },
];

export default function ProductListing({ onAddToCart, onViewDetails, onToggleWishlist, wishlistItems = [] }) {
  // UI state
  const [selectedCategory, setSelectedCategory] = useState(null); // e.g., "Plants"
  const [selectedSubcategory, setSelectedSubcategory] = useState(null); // e.g., "Indoor"
  const [sortBy, setSortBy] = useState('popularity');
  const [priceMax, setPriceMax] = useState(600); // INR slider default 600 (₹)
  const [filters, setFilters] = useState({ inStock: false, discount: false });

  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Derived sets for wishlist check
  const wishlistIds = useMemo(() => new Set((wishlistItems || []).map((w) => String(w.id))), [wishlistItems]);

  // Filtering
  const [remoteProducts, setRemoteProducts] = useState(null);

  // Load products from backend
  React.useEffect(() => {
    let isMounted = true;
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const fetchProducts = async () => {
      try {
        const res = await fetch(base + '/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (isMounted) setRemoteProducts(data);
      } catch (e) {
        console.error('Falling back to local SAMPLE_PRODUCTS:', e.message);
        if (isMounted) setRemoteProducts(null);
      }
    };

    fetchProducts();

    // Re-fetch on tab focus and every 30s for freshness
    const onFocus = () => fetchProducts();
    window.addEventListener('focus', onFocus);
    const iv = setInterval(fetchProducts, 30000);

    return () => { isMounted = false; window.removeEventListener('focus', onFocus); clearInterval(iv); };
  }, []);

  const filtered = useMemo(() => {
    let items = Array.isArray(remoteProducts) ? [...remoteProducts] : [...SAMPLE_PRODUCTS];

    // Category/subcategory filter
    if (selectedCategory) {
      items = items.filter((p) => p.category === selectedCategory);
    }
    if (selectedSubcategory) {
      items = items.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Price filter
    items = items.filter((p) => Number(p.price) <= Number(priceMax));

    // Checkbox filters
    if (filters.inStock) items = items.filter((p) => p.inStock);
    if (filters.discount) items = items.filter((p) => Number(p.discount || 0) > 0 || p.originalPrice);

    // Sorting helper + group Plants first when no category is selected
    const applySort = (arr) => {
      const copy = [...arr];
      switch (sortBy) {
        case 'price-asc':
          copy.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          copy.sort((a, b) => b.price - a.price);
          break;
        case 'new':
          copy.sort((a, b) => (b.isNew === true) - (a.isNew === true));
          break;
        case 'popularity':
        default:
          copy.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
      }
      return copy;
    };

    if (!selectedCategory) {
      const plants = items.filter((p) => p.category === 'Plants');
      const others = items.filter((p) => p.category !== 'Plants');
      items = [...applySort(plants), ...applySort(others)];
    } else {
      items = applySort(items);
    }

    return items;
  }, [remoteProducts, selectedCategory, selectedSubcategory, priceMax, filters, sortBy]);

  // Pagination slice
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageSlice = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  // Handlers
  const handleCategoryClick = (catKey) => {
    setSelectedCategory((prev) => (prev === catKey ? null : catKey));
    setSelectedSubcategory(null);
    setPage(1);
  };

  const handleSubcategoryClick = (subKey) => {
    setSelectedSubcategory((prev) => (prev === subKey ? null : subKey));
    setPage(1);
  };

  const toggleFilter = (key) => setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSortBy('popularity');
    setPriceMax(600);
    setFilters({ inStock: false, discount: false });
    setPage(1);
  };

  // Breadcrumb labels
  const breadcrumbTrail = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
  ];
  if (selectedCategory) breadcrumbTrail.push({ label: selectedCategory });
  if (selectedSubcategory) breadcrumbTrail.push({ label: selectedSubcategory });

  return (
    <div className="products-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        {breadcrumbTrail.map((b, idx) => (
          <span key={idx}>
            {b.to ? (
              <Link to={b.to}>{b.label}</Link>
            ) : (
              <span className={idx === breadcrumbTrail.length - 1 ? 'current' : ''}>{b.label}</span>
            )}
            {idx < breadcrumbTrail.length - 1 && <span className="sep">›</span>}
          </span>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Categories</h3>
        <ul className="category-list">
          {flatCategories.map((cat) => {
            const expanded = selectedCategory === cat.key;
            return (
              <li className="category-item" key={cat.key}>
                <button
                  className="category-title"
                  onClick={() => handleCategoryClick(cat.key)}
                  aria-expanded={expanded}
                >
                  <span>{cat.name}</span>
                  <span>{expanded ? '−' : '+'}</span>
                </button>
                {expanded && (
                  <ul className="subcategory-list">
                    {cat.children.map((sub) => (
                      <li key={sub.key} className="subcategory-item">
                        <button
                          className={
                            'subcategory-btn ' + (selectedSubcategory === sub.key ? 'active' : '')
                          }
                          onClick={() => handleSubcategoryClick(sub.key)}
                        >
                          {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main content */}
      <section className="products-area">
        <div className="topbar">
          <div className="row">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="row price-range">
            <label htmlFor="price">Price up to</label>
            <input
              id="price"
              type="range"
              min="0"
              max="1000"
              step="50"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
            />
            <span className="value">₹{priceMax}</span>
          </div>

          <div className="row checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={() => toggleFilter('inStock')}
              />
              In Stock
            </label>
            <label>
              <input
                type="checkbox"
                checked={filters.discount}
                onChange={() => toggleFilter('discount')}
              />
              Discount
            </label>
          </div>

          <div className="row">
            <button className="page-btn" onClick={resetFilters}>Reset</button>
          </div>
        </div>

        <div className="count-breadcrumb">
          <div>
            Showing {pageSlice.length} of {total} products
          </div>
        </div>

        <div className="product-grid">
          {pageSlice.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={wishlistIds.has(String(product.id))}
            />
          ))}
        </div>

        <div className="pagination">
          <button className="page-btn" disabled={pageSafe === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={"page-btn " + (n === pageSafe ? 'active' : '')}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button className="page-btn" disabled={pageSafe === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </button>
        </div>
      </section>
    </div>
  );
}