import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchCategories } from './categoriesData';
import './CategoryFirstPage.css';

const CategoryFirstPage = ({ onAddToCart, onViewDetails, onToggleWishlist, wishlistItems = [], user }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get wishlist IDs for quick lookup
  const wishlistIds = new Set((wishlistItems || []).map((w) => String(w.id)));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories from backend to get real data
        const backendCategories = await fetchCategories();
        setCategories(backendCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="category-first-page">
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
      <div className="category-first-page">
        <div className="max-w-7xl mx-auto">
          <div className="error-container">
            <p>Error loading categories: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="category-first-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.header 
          className="text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Shop by Category</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our curated categories and discover exactly what you need for your green journey.
          </p>
        </motion.header>

        <motion.div 
          className="category-grid"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map((cat, index) => (
            <motion.div
              key={cat.key}
              className="category-card"
              whileHover={{ y: -5 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Link to={`/products/${encodeURIComponent(cat.key)}`}>
                <div className="category-image-container">
                  <motion.img
                    src={cat.imageUrl || cat.cover || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop'}
                    alt={cat.name}
                    className="category-image"
                    whileHover={{ scale: 1.05 }}
                    onError={(e) => {
                      // Fallback to default image if the image fails to load
                      e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop';
                    }}
                  />
                  <div className="category-overlay">
                    <div className="category-content">
                      <h3>{cat.name}</h3>
                      <p>{cat.description || 'Browse products in this category'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CategoryFirstPage;