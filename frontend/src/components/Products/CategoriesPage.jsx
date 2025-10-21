import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../UI/SearchBar';
import { fetchCategories } from './categoriesData';

// Landing page for top-level categories (cards)
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query)) ||
      cat.children.some(child => 
        child.name.toLowerCase().includes(query) ||
        (child.description && child.description.toLowerCase().includes(query))
      )
    );
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 lg:px-10 mt-[70px]">
        <div className="max-w-7xl mx-auto">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 lg:px-10 mt-[70px]">
        <div className="max-w-7xl mx-auto">
          <div className="error-container">
            <p>Error loading categories: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 mt-[70px]">
      <div className="max-w-7xl mx-auto">
        <motion.header 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold">Shop by Category</h1>
          <p className="text-gray-600 mt-1">Browse curated categories and discover what you need faster.</p>
        </motion.header>

        {/* Search Bar */}
        <motion.div
          className="mb-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SearchBar
            placeholder="Search categories..."
            onSearch={setSearchQuery}
            className="max-w-md mx-auto"
            size="medium"
          />
        </motion.div>

        <motion.div 
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {filteredCategories.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-full text-center py-12"
              >
                <div className="text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? `No categories match "${searchQuery}"` : 'No categories available'}
                  </p>
                </div>
              </motion.div>
            ) : (
              filteredCategories.map((cat, index) => (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={`/categories/${encodeURIComponent(cat.key)}`}
                    className="group rounded-xl overflow-hidden border border-gray-200 bg-white shadow hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-40 md:h-48 w-full overflow-hidden">
                      {/* background cover image */}
                      <img
                        src={cat.cover}
                        alt={cat.name}
                        className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <h3 className="text-xl font-semibold drop-shadow">{cat.name}</h3>
                        <p className="text-white/90 text-sm drop-shadow">{cat.children.length} subcategories</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}