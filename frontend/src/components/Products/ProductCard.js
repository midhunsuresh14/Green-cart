import React from 'react';

const formatINR = (value) => {
  if (value == null) return '';
  const num = Number(value);
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const ProductCard = ({ product, onAddToCart, onViewDetails, onToggleWishlist, isInWishlist }) => {
  const categoryClass = `category-${(product.category || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className={"product-card " + categoryClass}>
      <div className="product-image-container" onClick={() => onViewDetails && onViewDetails(product)}>
        <img
          src={
            product.imageUrl ||
            product.image ||
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80'
          }
          alt={product.name}
          className="product-image"
        />

        <div className="category-badge">
          {product.subcategory || product.category}
        </div>

        <div className="action-buttons">
          <button
            className={`action-btn ${isInWishlist ? 'wishlist-active' : ''}`}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={(e) => { e.stopPropagation(); onToggleWishlist && onToggleWishlist(product); }}
          >
            <span className="material-icons">
              {isInWishlist ? 'favorite' : 'favorite_border'}
            </span>
          </button>
        </div>

        {/* Hover overlay actions */}
        <div className="hover-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="overlay-actions">
            <button
              className="overlay-btn"
              onClick={() => onViewDetails && onViewDetails(product)}
            >
              <span className="material-icons">visibility</span>
              <span>View</span>
            </button>
            <button
              className="overlay-btn primary"
              onClick={() => onAddToCart && onAddToCart(product)}
            >
              <span className="material-icons">shopping_cart</span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-rating">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="star"
                style={{ color: i < (product.rating || 0) ? '#fbbf24' : '#e5e7eb' }}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-count">({product.reviews})</span>
        </div>

        <div className="product-price">
          <span className="current-price">{formatINR(product.price)}</span>
          {product.originalPrice && (
            <span className="original-price">{formatINR(product.originalPrice)}</span>
          )}
          {product.discount && (
            <span className="discount-badge">-{product.discount}%</span>
          )}
        </div>

        <button
          className="add-to-cart-btn"
          onClick={() => onAddToCart && onAddToCart(product)}
        >
          <span className="material-icons">shopping_cart</span>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

