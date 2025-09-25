import React, { useMemo, useState, useEffect } from 'react';
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
  const [priceMax, setPriceMax] = useState(600); // current selected upper bound
  const [priceUpperBound, setPriceUpperBound] = useState(1000); // dynamic slider max
  const [filters, setFilters] = useState({ inStock: false, discount: false });

  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Modal preview state for in-page "View" popup
  const [previewProduct, setPreviewProduct] = useState(null);

  // Derived sets for wishlist check
  const wishlistIds = useMemo(() => new Set((wishlistItems || []).map((w) => String(w.id))), [wishlistItems]);

  // Filtering
  const [remoteProducts, setRemoteProducts] = useState(null);

  // Load products from backend
  React.useEffect(() => {
    let isMounted = true;
    let fetchTimeout = null;
    const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

    const applyPriceBounds = (list) => {
      try {
        const max = Math.max(1000, ...list.map((p) => Number(p.price) || 0));
        setPriceUpperBound(max);
        // Only update priceMax if it's still at default
        setPriceMax(prev => prev === 600 ? max : prev);
      } catch (_) {
        setPriceUpperBound(1000);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch(base + '/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (isMounted) {
          setRemoteProducts(data);
          applyPriceBounds(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Falling back to local SAMPLE_PRODUCTS:', e.message);
        if (isMounted) {
          setRemoteProducts(null);
          applyPriceBounds(SAMPLE_PRODUCTS);
        }
      }
    };

    // Debounced fetch to prevent rapid API calls
    const debouncedFetch = () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
      fetchTimeout = setTimeout(fetchProducts, 300);
    };

    fetchProducts();

    // Re-fetch on tab focus (debounced)
    const onFocus = () => debouncedFetch();
    window.addEventListener('focus', onFocus);

    // Listen to storage events from Admin panel (debounced)
    const onStorage = (e) => {
      if (e.key === 'products:updated') {
        debouncedFetch();
      }
    };
    window.addEventListener('storage', onStorage);

    // Reduced polling - only every 60 seconds for background updates
    const iv = setInterval(fetchProducts, 60000);

    return () => {
      isMounted = false;
      if (fetchTimeout) clearTimeout(fetchTimeout);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      clearInterval(iv);
    };
  }, []);

  const filtered = useMemo(() => {
    const items = Array.isArray(remoteProducts) ? remoteProducts : SAMPLE_PRODUCTS;
    
    // Early return if no items
    if (!items.length) return [];

    let filtered = items;

    // Apply filters in sequence (most selective first for performance)
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (selectedSubcategory) {
      filtered = filtered.filter((p) => p.subcategory === selectedSubcategory);
    }
    
    // Price filter
    filtered = filtered.filter((p) => Number(p.price || 0) <= Number(priceMax));

    // Checkbox filters
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.inStock);
    }
    if (filters.discount) {
      filtered = filtered.filter((p) => Number(p.discount || 0) > 0 || p.originalPrice);
    }

    // Sorting
    const sortedItems = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        sortedItems.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-desc':
        sortedItems.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'new':
        sortedItems.sort((a, b) => (b.isNew === true ? 1 : 0) - (a.isNew === true ? 1 : 0));
        break;
      case 'popularity':
      default:
        sortedItems.sort((a, b) => (Number(b.popularity) || 0) - (Number(a.popularity) || 0));
        break;
    }

    // Group Plants first only when no category is selected
    if (!selectedCategory) {
      const plants = sortedItems.filter((p) => p.category === 'Plants');
      const others = sortedItems.filter((p) => p.category !== 'Plants');
      return [...plants, ...others];
    }

    return sortedItems;
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

  const resetFilters = React.useCallback(() => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSortBy('popularity');
    setPriceMax(priceUpperBound); // Reset to current max instead of hardcoded 600
    setFilters({ inStock: false, discount: false });
    setPage(1);
  }, [priceUpperBound]);

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
              max={priceUpperBound}
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
              onViewDetails={onViewDetails ? onViewDetails : (p) => setPreviewProduct(p)}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={wishlistIds.has(String(product.id))}
            />
          ))}
        </div>

        {/* Simple modal popup for product preview */}
        {(!onViewDetails) && previewProduct && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setPreviewProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" aria-label="Close" onClick={() => setPreviewProduct(null)}>×</button>
              <div className="modal-body">
                <div className="modal-image">
                  <img
                    src={(function(){
                      const raw = previewProduct?.imageUrl || previewProduct?.image || previewProduct?.image_path || previewProduct?.imagePath || previewProduct?.thumbnail || previewProduct?.photo || previewProduct?.photoUrl || previewProduct?.url;
                      if (!raw) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80';
                      if (/^https?:\/\//i.test(raw)) return raw;
                      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
                      const host = apiBase.replace(/\/api\/?$/, '');
                      return raw.startsWith('/') ? host + raw : host + '/' + raw;
                    })()}
                    alt={previewProduct.name}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80'; }}
                  />
                </div>
                <div className="modal-details">
                  <h3>{previewProduct.name}</h3>
                  <p>{previewProduct.description}</p>
                  <div className="price">₹{previewProduct.price}</div>
                  <div className="actions">
                    <button className="primary" onClick={() => { onAddToCart && onAddToCart(previewProduct); setPreviewProduct(null);} }>
                      <span className="material-icons">shopping_cart</span>
                      Add to Cart
                    </button>
                    <button onClick={() => setPreviewProduct(null)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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