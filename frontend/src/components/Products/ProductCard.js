import React, { useState, useEffect } from 'react';

const formatINR = (value) => {
  if (value == null) return '';
  const num = Number(value);
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const ProductCard = ({ product, onAddToCart, onViewDetails, onToggleWishlist, isInWishlist, user }) => {
  const [stockInfo, setStockInfo] = useState({ stock: product.stock || 0, inStock: (product.stock || 0) > 0 });
  const [loadingStock, setLoadingStock] = useState(false);

  const categoryClass = `category-${(product.category || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;

  // Fetch real-time stock information when component mounts
  useEffect(() => {
    const fetchStockInfo = async () => {
      if (!product.id && !product._id) return;
      
      setLoadingStock(true);
      try {
        const productId = product.id || product._id;
        const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const response = await fetch(`${apiBase}/products/${productId}/stock`);
        
        if (response.ok) {
          const data = await response.json();
          setStockInfo({
            stock: data.stock,
            inStock: data.inStock
          });
        }
      } catch (error) {
        console.error('Error fetching stock info:', error);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStockInfo();
  }, [product.id, product._id]);

  const resolveImageUrl = (src) => {
    if (!src) return null;
    // If it's already a full URL, return as is
    if (/^https?:\/\//i.test(src)) return src;
    // If it's a local path, prepend the API base URL
    const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
    const host = apiBase.replace(/\/api\/?$/, '');
    return src.startsWith('/') ? host + src : host + '/' + src;
  };

  // Use the correct image field from the product data
  const primarySrc = resolveImageUrl(product.imageUrl || product.image) ||
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80';

  // Handle add to cart with authentication check
  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    
    if (!stockInfo.inStock) {
      alert('This product is currently out of stock');
      return;
    }

    // Check availability before adding to cart
    try {
      const productId = product.id || product._id;
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const response = await fetch(`${apiBase}/products/${productId}/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!data.available) {
          alert(`Only ${data.maxAvailable} items available in stock`);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }

    onAddToCart && onAddToCart(product);
  };

  // Handle wishlist toggle with authentication check
  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    
    const btn = e.currentTarget;
    btn.classList.remove('wishlist-anim');
    // Force reflow to restart animation
    void btn.offsetWidth;
    btn.classList.add('wishlist-anim');
    onToggleWishlist && onToggleWishlist(product);
  };

  return (
    <div className={"product-card " + categoryClass}>
      <div className="product-image-container" onClick={() => onViewDetails && onViewDetails(product)}>
        <img
          src={primarySrc}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            // Fallback to a default image if the product image fails to load
            e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80';
          }}
        />

        <div className="category-badge">
          {product.subcategory || product.category}
        </div>

        {/* Stock status indicator */}
        {!loadingStock && (
          <div className={`stock-badge ${stockInfo.inStock ? 'in-stock' : 'out-of-stock'}`}>
            {stockInfo.inStock ? (
              <span>{stockInfo.stock} in stock</span>
            ) : (
              <span>Out of Stock</span>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button
            className={`action-btn ${isInWishlist ? 'wishlist-active' : ''}`}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={handleToggleWishlist}
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
              <span>View Details</span>
            </button>
            <button
              className={`overlay-btn primary ${!stockInfo.inStock ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={!stockInfo.inStock}
            >
              <span className="material-icons">shopping_cart</span>
              <span>Add to Cart</span>
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
          <span className="rating-count">({product.reviews || 0})</span>
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

        {/* Out of stock message */}
        {!stockInfo.inStock && (
          <div className="out-of-stock-message">
            <span className="material-icons">error_outline</span>
            <span>This product is currently unavailable</span>
          </div>
        )}

        <div className="product-actions-row">
          <button
            className={`add-to-cart-btn ${!stockInfo.inStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!stockInfo.inStock}
          >
            <span className="material-icons">shopping_cart</span>
            <span>{stockInfo.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
          <button
            className={"add-to-wishlist-btn " + (isInWishlist ? 'active' : '')}
            onClick={handleToggleWishlist}
          >
            <span className="material-icons">{isInWishlist ? 'favorite' : 'favorite_border'}</span>
            <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;