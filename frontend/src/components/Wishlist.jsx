import React from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css';

const Wishlist = ({ wishlistItems, onRemoveFromWishlist, onAddToCart, onViewDetails }) => {
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-empty">
            <div className="empty-icon">
              <span className="material-icons">favorite_border</span>
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>Start adding plants you love to your wishlist!</p>
            <Link to="/products" className="browse-btn">
              Browse Plants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
        </div>

        <div className="wishlist-grid">
          {wishlistItems.map((product) => (
            <div key={product.id} className="wishlist-card">
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
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="wishlist-content">
                <div className="category-badge">
                  {product.category}
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
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
                  <span className="current-price">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="original-price">₹{product.originalPrice}</span>
                  )}
                  {product.discount && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}
                </div>

                <div className="wishlist-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => onAddToCart(product)}
                  >
                    <span className="material-icons">shopping_cart</span>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
