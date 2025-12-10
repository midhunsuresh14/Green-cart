import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import SearchBar from '../UI/SearchBar';
import { fetchCategories } from './categoriesData';
import './CategoryProductPage.css';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'new', label: 'New Arrivals' },
];

const CategoryProductPage = ({ onAddToCart, onViewDetails, onToggleWishlist, wishlistItems = [], user }) => {
  const { categoryKey } = useParams();
  const decodedCategoryKey = decodeURIComponent(categoryKey || '');

  // UI state
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceMax, setPriceMax] = useState(1000);
  const [filters, setFilters] = useState({ inStock: false, discount: false });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data state
  const [categories, setCategories] = useState([]);
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get wishlist IDs for quick lookup
  const wishlistIds = useMemo(() => new Set((wishlistItems || []).map((w) => String(w.id))), [wishlistItems]);

  // Load categories and products
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoryData = await fetchCategories();
        if (isMounted) {
          setCategories(categoryData);
        }

        // Fetch products
        const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const res = await fetch(`${base}/products`);

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        if (isMounted) {
          setRemoteProducts(data);
        }
      } catch (e) {
        console.error('Error fetching data:', e);
        if (isMounted) {
          setError(e.message || 'Failed to fetch products');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get current category data
  const currentCategory = categories.find(cat => cat.key === decodedCategoryKey) || null;

  // Get subcategories for current category
  const subcategories = currentCategory?.children || [];

  // Filter products based on category, subcategory, search query, and other filters
  const filteredProducts = useMemo(() => {
    let items = Array.isArray(remoteProducts) ? [...remoteProducts] : [];

    // Filter by main category
    if (decodedCategoryKey) {
      items = items.filter((p) => p.category === decodedCategoryKey);
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'All') {
      items = items.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((p) =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query))
      );
    }

    // Price filter
    items = items.filter((p) => Number(p.price) <= Number(priceMax));

    // Checkbox filters
    if (filters.inStock) items = items.filter((p) => (p.stock || 0) > 0);
    if (filters.discount) items = items.filter((p) => Number(p.discount || 0) > 0 || p.originalPrice);

    // Sorting
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

    return applySort(items);
  }, [remoteProducts, decodedCategoryKey, selectedSubcategory, searchQuery, priceMax, filters, sortBy]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory('All');
  }, [decodedCategoryKey]);

  const toggleFilter = (key) => setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetFilters = () => {
    setSelectedSubcategory('All');
    setSortBy('popularity');
    setPriceMax(1000);
    setFilters({ inStock: false, discount: false });
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="category-product-page">
        <div className="max-w-7xl mx-auto">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-product-page">
        <div className="max-w-7xl mx-auto">
          <div className="error-container">
            <p>Error loading products: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="category-product-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <motion.nav
          className="category-breadcrumb"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/products">All Categories</Link>
          <span className="separator">›</span>
          <span>{currentCategory?.name || decodedCategoryKey}</span>
        </motion.nav>

        {/* Header */}
        <motion.header
          className="category-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="category-header-main">
            <h1>{currentCategory?.name || decodedCategoryKey}</h1>
            <p>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available</p>
          </div>
          <div className="category-header-actions">
            <div></div> {/* Spacer */}
            <motion.button
              className="reset-filters-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
            >
              <span>Reset Filters</span>
            </motion.button>
          </div>
        </motion.header>



        <div className="category-layout">
          {/* Filters Sidebar */}
          <motion.aside
            className="filters-sidebar"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="filters-header">
              <h3>Filters</h3>
              <button
                className="toggle-filters-btn"
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              >
                <span className="material-icons">filter_list</span>
              </button>
            </div>

            <div className={`filters-content ${isMobileFiltersOpen ? 'open' : ''}`}>
              {/* Search in Sidebar */}
              <div className="filters-section">
                <h4>Search Products</h4>
                <SearchBar
                  placeholder="Search products..."
                  onSearch={setSearchQuery}
                  className="w-full"
                  size="small"
                />
              </div>

              {/* Subcategory Filter */}
              {subcategories.length > 0 && (
                <div className="filters-section">
                  <h4>Subcategories</h4>
                  <div className="subcategory-list">
                    <button
                      className={`subcategory-btn ${selectedSubcategory === 'All' ? 'active' : ''}`}
                      onClick={() => setSelectedSubcategory('All')}
                    >
                      All
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub.key}
                        className={`subcategory-btn ${selectedSubcategory === sub.key ? 'active' : ''}`}
                        onClick={() => setSelectedSubcategory(sub.key)}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter */}
              <div className="filters-section">
                <h4>Price Range</h4>
                <div className="price-range">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="price-slider"
                  />
                  <div className="price-values">
                    <span>₹0</span>
                    <span>₹{priceMax}</span>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="filters-section">
                <h4>Availability</h4>
                <div className="availability-options">
                  <label className="availability-option">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={() => toggleFilter('inStock')}
                    />
                    <span>In Stock Only</span>
                  </label>
                  <label className="availability-option">
                    <input
                      type="checkbox"
                      checked={filters.discount}
                      onChange={() => toggleFilter('discount')}
                    />
                    <span>On Sale</span>
                  </label>
                </div>
              </div>

              {/* Sort By */}
              <div className="filters-section">
                <h4>Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <motion.section
            className="products-area"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {filteredProducts.length === 0 ? (
                <motion.div
                  className="no-products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p>No products found matching your criteria.</p>
                  <motion.button
                    className="reset-filters-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  className="products-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ProductCard
                          product={product}
                          user={user}
                          onAddToCart={onAddToCart}
                          onViewDetails={onViewDetails}
                          onToggleWishlist={onToggleWishlist}
                          isInWishlist={wishlistIds.has(String(product.id))}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryProductPage;