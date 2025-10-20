import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './ProductListing.css';
import OptimizedProductCard from './OptimizedProductCard';
import { fetchCategories } from './categoriesData';
import { Link } from 'react-router-dom';

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'new', label: 'New Arrivals' },
];

// Debounce function to limit API calls
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const OptimizedProductListing = ({ onAddToCart, onViewDetails, onToggleWishlist, wishlistItems = [], user }) => {
  // UI state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [sortBy, setSortBy] = useState('popularity');
  const [priceMax, setPriceMax] = useState(600);
  const [filters, setFilters] = useState({ inStock: false, discount: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Derived sets for wishlist check
  const wishlistIds = useMemo(() => new Set((wishlistItems || []).map((w) => String(w.id))), [wishlistItems]);

  // Category data
  const [categories, setCategories] = useState([]);

  // Product data
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load categories and products from backend
  const loadData = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories
      const categoryData = await fetchCategories();
      if (!signal.aborted) {
        setCategories(categoryData);
      }
      
      // Fetch products with better error handling
      const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      console.log('Fetching products from:', base + '/products');
      
      const res = await fetch(base + '/products', { signal });
      if (!signal.aborted) {
        console.log('Products API response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Products API error response:', errorText);
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText} - ${errorText}`);
        }
        
        const data = await res.json();
        console.log('Products data received:', data);
        setRemoteProducts(data);
      }
    } catch (e) {
      if (!signal.aborted) {
        console.error('Error fetching data:', e);
        setError(e.message || 'Failed to fetch products');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    loadData(controller.signal);

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [loadData]);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    let items = Array.isArray(remoteProducts) ? [...remoteProducts] : [];

    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      items = items.filter((p) => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query))
      );
    }

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
    if (filters.inStock) items = items.filter((p) => (p.stock || 0) > 0);
    if (filters.discount) items = items.filter((p) => Number(p.discount || 0) > 0 || p.originalPrice);

    // Sorting helper
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

    // Group Plants first when no category is selected
    if (!selectedCategory) {
      const plants = items.filter((p) => p.category === 'Plants');
      const others = items.filter((p) => p.category !== 'Plants');
      items = [...applySort(plants), ...applySort(others)];
    } else {
      items = applySort(items);
    }

    return items;
  }, [remoteProducts, selectedCategory, selectedSubcategory, priceMax, filters, sortBy, debouncedSearchQuery]);

  // Pagination slice
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageSlice = filteredProducts.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

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
    setSearchQuery('');
    setPage(1);
  };

  // Breadcrumb labels
  const breadcrumbTrail = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
  ];
  if (selectedCategory) breadcrumbTrail.push({ label: selectedCategory });
  if (selectedSubcategory) breadcrumbTrail.push({ label: selectedSubcategory });

  // Get all subcategories for the selected category
  const currentSubcategories = categories.find(cat => cat.key === selectedCategory)?.children || [];

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <p>Error loading products: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

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

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <span className="material-icons">search</span>
          </button>
        </div>
      </div>

      {/* Mobile Category Menu Button */}
      <div className="mobile-category-toggle">
        <button 
          className="category-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-icons">menu</span>
          Categories
          <span className="material-icons">{isMobileMenuOpen ? 'expand_less' : 'expand_more'}</span>
        </button>
      </div>

      {/* Horizontal Category Navigation */}
      <div className="category-navigation">
        <div className="category-nav-container">
          <button
            className={`category-nav-item ${!selectedCategory ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setPage(1);
            }}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <div key={cat.key} className="category-dropdown">
              <button
                className={`category-nav-item ${selectedCategory === cat.key ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.key)}
              >
                {cat.name}
                {cat.children.length > 0 && <span className="material-icons">arrow_drop_down</span>}
              </button>
              {cat.children.length > 0 && selectedCategory === cat.key && (
                <div className="subcategory-dropdown">
                  {cat.children.map((sub) => (
                    <button
                      key={sub.key}
                      className={`subcategory-item ${selectedSubcategory === sub.key ? 'active' : ''}`}
                      onClick={() => handleSubcategoryClick(sub.key)}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <aside className="mobile-sidebar">
          <div className="mobile-sidebar-header">
            <h3>Categories</h3>
            <button 
              className="close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          <ul className="category-list">
            <li className="category-item">
              <button
                className={`category-title ${!selectedCategory ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setPage(1);
                  setIsMobileMenuOpen(false);
                }}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => {
              const expanded = selectedCategory === cat.key;
              return (
                <li className="category-item" key={cat.key}>
                  <button
                    className={`category-title ${expanded ? 'active' : ''}`}
                    onClick={() => {
                      handleCategoryClick(cat.key);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span>{cat.name}</span>
                  </button>
                  {expanded && cat.children.length > 0 && (
                    <ul className="subcategory-list">
                      {cat.children.map((sub) => (
                        <li key={sub.key} className="subcategory-item">
                          <button
                            className={`subcategory-btn ${selectedSubcategory === sub.key ? 'active' : ''}`}
                            onClick={() => {
                              handleSubcategoryClick(sub.key);
                              setIsMobileMenuOpen(false);
                            }}
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
      )}

      {/* Main content */}
      <section className="products-area">
        <div className="topbar">
          <div className="topbar-controls">
            <div className="topbar-row">
              <label htmlFor="sort">Sort by</label>
              <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="topbar-row price-range">
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

            <div className="topbar-row checkbox-group">
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

            <div className="topbar-row">
              <button className="page-btn" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>

        {/* Subcategory Filter Bar (only shown when a category is selected) */}
        {selectedCategory && currentSubcategories.length > 0 && (
          <div className="subcategory-filter">
            <button
              className={`subcategory-filter-item ${!selectedSubcategory ? 'active' : ''}`}
              onClick={() => {
                setSelectedSubcategory(null);
                setPage(1);
              }}
            >
              All
            </button>
            {currentSubcategories.map((sub) => (
              <button
                key={sub.key}
                className={`subcategory-filter-item ${selectedSubcategory === sub.key ? 'active' : ''}`}
                onClick={() => handleSubcategoryClick(sub.key)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        <div className="count-breadcrumb">
          <div>
            Showing {pageSlice.length} of {total} products
          </div>
        </div>

        {total === 0 ? (
          <div className="no-products-message">
            <p>No products found matching your criteria.</p>
            <button onClick={resetFilters}>Reset filters</button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {pageSlice.map((product) => (
                <OptimizedProductCard
                  key={product.id}
                  product={product}
                  user={user}
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
          </>
        )}
      </section>
    </div>
  );
};

export default OptimizedProductListing;