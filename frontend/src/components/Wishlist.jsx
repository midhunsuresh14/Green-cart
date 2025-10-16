import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, ArrowRight, Check } from 'lucide-react';
import './Wishlist.css';

const Wishlist = ({ wishlistItems, onRemoveFromWishlist, onAddToCart }) => {
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    try {
      await onAddToCart(product);
      setShowSuccess(product.id);
      setTimeout(() => setShowSuccess(null), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-empty">
            <motion.div 
              className="empty-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Your Wishlist is Empty
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Start adding plants you love to your wishlist!
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link to="/products" className="browse-btn">
                <span>Browse Plants</span>
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <motion.div 
          className="wishlist-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>My Wishlist</h1>
          <p>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
        </motion.div>

        <div className="wishlist-grid">
          <AnimatePresence>
            {wishlistItems.map((product) => (
              <motion.div 
                key={product.id}
                className="wishlist-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="wishlist-image-container">
                  <img
                    src={(function(){
                      const raw = product?.imageUrl || product?.image || product?.image_path || product?.imagePath || product?.thumbnail || product?.photo || product?.photoUrl || product?.url;
                      if (!raw) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80';
                      if (/^https?:\/\//i.test(raw)) return raw;
                      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
                      const host = apiBase.replace(/\/api\/?$/, '');
                      return raw.startsWith('/') ? host + raw : host + '/' + raw;
                    })()}
                    alt={product.name}
                    className="wishlist-image"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80'; }}
                  />
                  <button
                    className="remove-wishlist-btn"
                    onClick={() => onRemoveFromWishlist(product.id)}
                    title="Remove from Wishlist"
                    aria-label="Remove from wishlist"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="wishlist-content">
                  <div className="category-badge">
                    {product.category || 'Plant'}
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  {product.description && (
                    <p className="product-description">
                      {product.description.length > 80 
                        ? `${product.description.substring(0, 80)}...` 
                        : product.description}
                    </p>
                  )}
                  
                  <div className="product-rating">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`star ${i < (product.rating || 0) ? 'filled' : 'empty'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="rating-count">({product.reviews || 0})</span>
                  </div>

                  <div className="product-price">
                    <span className="current-price">₹{product.price?.toLocaleString() || '0'}</span>
                    {product.originalPrice && (
                      <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
                    )}
                    {product.discount && (
                      <span className="discount-badge">-{product.discount}%</span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      className={`add-to-cart-btn ${addingToCart === product.id ? 'adding' : ''} ${showSuccess === product.id ? 'success' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id || showSuccess === product.id}
                    >
                      {showSuccess === product.id ? (
                        <>
                          <Check size={18} className="mr-2" />
                          Added!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} className="mr-2" />
                          {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                        </>
                      )}
                    </button>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(product.id)}
                    >
                      <span>View Details</span>
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
