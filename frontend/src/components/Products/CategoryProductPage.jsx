import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ShoppingBag, Filter, X, Search, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchCategories } from './categoriesData';

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
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-slate-100 border-t-[#2F6C4E]"></div>
          <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
        <div className="bg-red-50 rounded-[2rem] p-8 text-center border border-red-100 max-w-md w-full">
          <p className="text-red-600 font-medium mb-4">Error loading products</p>
          <div className="text-sm text-red-400 mb-6">{error}</div>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[#FDFCF8]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mini Hero Header */}
      <div className="bg-[#2F6C4E] pt-24 pb-20 px-4 rounded-b-[3rem] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-white gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2 opacity-80">
              <Link to="/products" className="hover:underline hover:text-green-300 transition-colors">All Categories</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="font-bold">{currentCategory?.name || decodedCategoryKey}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{currentCategory?.name || decodedCategoryKey}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex flex-col items-center">
              <span className="text-2xl font-black">{filteredProducts.length}</span>
              <span className="text-xs uppercase tracking-wider font-medium opacity-80">Products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile Filter Toggle */}
          <button
            className="lg:hidden flex items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-md font-bold text-slate-700"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <Filter className="w-5 h-5" />
            <span>Filters & Sort</span>
          </button>

          {/* Sidebar Filters */}
          <AnimatePresence>
            {(isMobileFiltersOpen || window.innerWidth >= 1024) && (
              <motion.aside
                className={`fixed inset-0 z-50 lg:static lg:z-auto bg-black/50 lg:bg-transparent lg:block lg:w-80 flex-shrink-0 ${isMobileFiltersOpen ? 'flex' : 'hidden'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <motion.div
                  className="bg-white w-full max-w-sm h-full lg:h-auto lg:min-h-[calc(100vh-200px)] lg:sticky lg:top-24 p-6 lg:rounded-[2rem] lg:shadow-xl lg:shadow-slate-200/50 overflow-y-auto"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5" />
                      Filters
                    </h3>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="lg:hidden p-2 bg-slate-100 rounded-full text-slate-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type to search..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F6C4E]/20 focus:border-[#2F6C4E] transition-all font-medium text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Subcategories */}
                  {subcategories.length > 0 && (
                    <div className="mb-8 pl-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Categories</label>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedSubcategory('All')}
                          className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${selectedSubcategory === 'All'
                            ? 'bg-[#2F6C4E] text-white shadow-lg shadow-green-900/20'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                            }`}
                        >
                          All Products
                          {selectedSubcategory === 'All' && <ChevronRight className="w-4 h-4" />}
                        </button>
                        {subcategories.map(sub => (
                          <button
                            key={sub.key}
                            onClick={() => setSelectedSubcategory(sub.key)}
                            className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${selectedSubcategory === sub.key
                              ? 'bg-[#2F6C4E] text-white shadow-lg shadow-green-900/20'
                              : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                              }`}
                          >
                            {sub.name}
                            {selectedSubcategory === sub.key && <ChevronRight className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Price</label>
                      <span className="text-sm font-black text-[#2F6C4E]">₹{priceMax}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2F6C4E]"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                      <span>₹0</span>
                      <span>₹2000+</span>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="mb-8 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${filters.inStock ? 'bg-[#2F6C4E] border-[#2F6C4E]' : 'border-slate-300 group-hover:border-[#2F6C4E]'}`}>
                        {filters.inStock && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <input type="checkbox" checked={filters.inStock} onChange={() => toggleFilter('inStock')} className="hidden" />
                      <span className="text-sm font-bold text-slate-600">In Stock Only</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${filters.discount ? 'bg-[#2F6C4E] border-[#2F6C4E]' : 'border-slate-300 group-hover:border-[#2F6C4E]'}`}>
                        {filters.discount && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <input type="checkbox" checked={filters.discount} onChange={() => toggleFilter('discount')} className="hidden" />
                      <span className="text-sm font-bold text-slate-600">On Sale</span>
                    </label>
                  </div>

                  {/* Sort By */}
                  <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Sort By</label>
                    <div className="relative">
                      <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F6C4E]/20 focus:border-[#2F6C4E] transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                      >
                        {SORT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-500 hover:border-slate-300 hover:text-slate-600 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </motion.div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <main className="flex-grow">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">No products found</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">We couldn't find any products matching your current filters.</p>
                <button
                  onClick={resetFilters}
                  className="px-8 py-3 bg-[#2F6C4E] text-white rounded-xl font-bold hover:bg-[#24553d] transition-colors shadow-lg shadow-green-900/20"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
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
              </div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryProductPage;