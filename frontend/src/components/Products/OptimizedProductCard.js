import React, { useState, useCallback, memo } from 'react';

const formatINR = (value) => {
  if (value == null) return '';
  const num = Number(value);
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

// Optimized Lazy Image Component
const LazyImage = memo(({ src, alt, className, onError }) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = React.useRef();

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleImageLoad = useCallback(() => {
    setHasLoaded(true);
  }, []);

  const handleError = useCallback((e) => {
    setHasLoaded(true);
    onError && onError(e);
  }, [onError]);

  return (
    <div 
      ref={imgRef} 
      className={`${className} ${hasLoaded ? 'loaded' : 'loading'}`}
    >
      {shouldLoad ? (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleError}
          loading="lazy"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: hasLoaded ? 1 : 0, 
            transition: 'opacity 0.3s ease',
            display: 'block'
          }}
        />
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #2e7d32',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
    </div>
  );
});

// Add CSS for loading spinner
const ImageStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const OptimizedProductCard = ({ product, onAddToCart, onViewDetails, onToggleWishlist, isInWishlist, user }) => {
  // Use stock information directly from the product data
  const stockInfo = {
    stock: product.stock || 0,
    inStock: (product.stock || 0) > 0
  };

  // Memoized category class to prevent recalculation
  const categoryClass = React.useMemo(() => {
    return `category-${(product.category || '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`;
  }, [product.category]);

  // Memoized image URL resolution
  const primarySrc = React.useMemo(() => {
    const resolveImageUrl = (src) => {
      if (!src) return null;
      // If it's already a full URL, return as is
      if (/^https?:\/\//i.test(src)) return src;
      // If it's a local path that already starts with /uploads/, return as is
      if (src.startsWith('/uploads/')) return src;
      // If it's a local path, prepend the API base URL
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const host = apiBase.replace(/\/api\/?$/, '');
      return src.startsWith('/') ? host + src : host + '/' + src;
    };

    // Use the correct image field from the product data
    const imageUrl = resolveImageUrl(product.imageUrl || product.image);
    console.log('Product image URL resolution:', { 
      productId: product.id, 
      productName: product.name,
      originalImageUrl: product.imageUrl, 
      originalImage: product.image, 
      resolvedUrl: imageUrl 
    });
    
    return imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80';
  }, [product.imageUrl, product.image]);

  // Memoized event handlers to prevent recreation on every render
  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    
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

    onAddToCart && onAddToCart(product);
  }, [user, stockInfo.inStock, product, onAddToCart]);

  const handleToggleWishlist = useCallback((e) => {
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
  }, [user, product, onToggleWishlist]);

  const handleViewDetails = useCallback((e) => {
    e.stopPropagation();
    onViewDetails && onViewDetails(product);
  }, [onViewDetails, product]);

  // Optimized image error handler
  const handleImageError = useCallback((e) => {
    // Fallback to a default image if the product image fails to load
    e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80';
  }, []);

  // Add CSS styles to head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = ImageStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={"product-card " + categoryClass}>
      <div className="product-image-container" onClick={handleViewDetails}>
        <LazyImage
          src={primarySrc}
          alt={product.name}
          className="product-image"
          onError={handleImageError}
        />

        <div className="category-badge">
          {product.subcategory || product.category}
        </div>

        {/* Stock status indicator */}
        <div className={`stock-badge ${stockInfo.inStock ? 'in-stock' : 'out-of-stock'}`}>
          {stockInfo.inStock ? (
            <span>{stockInfo.stock} in stock</span>
          ) : (
            <span>Out of Stock</span>
          )}
        </div>

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
              onClick={handleViewDetails}
            >
              <span className="material-icons">visibility</span>
              <span>View Details</span>
            </button>
            <button
              className={`overlay-btn primary ${!stockInfo.inStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
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

export default memo(OptimizedProductCard);