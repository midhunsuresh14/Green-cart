import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, onViewDetails, onToggleWishlist, isInWishlist }) => {
  const [stockInfo, setStockInfo] = useState({ stock: product.stock || 0, inStock: (product.stock || 0) > 0 });
  const [loadingStock, setLoadingStock] = useState(false);

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

  // Determine stock status
  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of Stock', className: 'out-of-stock' };
    if (stock < 10) return { text: 'Almost Out of Stock', className: 'low-stock' };
    if (stock < 20) return { text: 'Low Stock', className: 'medium-stock' };
    return { text: 'In Stock', className: 'in-stock' };
  };

  const stockStatus = getStockStatus(stockInfo.stock);
  const isOutOfStock = !stockInfo.inStock;

  // Get base URL for API requests
  const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
  };

  // Handle image URL construction and fallback
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-product.jpg';

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
      return imagePath;
    }

    // If it starts with /uploads, it's from the backend
    if (imagePath.startsWith('/uploads/')) {
      return `${getBaseUrl()}${imagePath}`;
    }

    // Default case - assume it's a local path
    return imagePath;
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if placeholder also fails
    e.target.src = '/images/placeholder-product.jpg';
  };

  // Handle add to cart with stock check
  const handleAddToCart = async () => {
    if (isOutOfStock) {
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

    onAddToCart(product);
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    onAddToCart(product);
    // You might want to navigate to checkout here
    // navigate('/checkout'); 
  };

  return (
    <div className="product-card group">
      <div className="product-image-wrapper">
        <Link to={`/pdp/${product.id}`} onClick={() => onViewDetails(product)}>
          <img
            src={getImageUrl(product.imageUrl || product.image_url || product.image)}
            alt={product.name}
            onError={handleImageError}
            className="product-image"
            loading="lazy"
          />
        </Link>
        <button
          className={`wishlist-icon-btn ${isInWishlist ? 'active' : ''}`}
          onClick={() => onToggleWishlist(product)}
        >
          <span className="material-icons">{isInWishlist ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>

      <div className="product-content">
        <div className="product-header">
          <Link to={`/pdp/${product.id}`} className="product-title-link">
            <h3 className="product-title">{product.name}</h3>
          </Link>
          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-icons star-icon">star</span>
              ))}
            </div>
            <span className="rating-text">4.8 (120)</span>
          </div>
        </div>

        <div className="product-price-section">
          <span className="current-price">₹{product.price?.toLocaleString()}</span>
        </div>

        {!loadingStock && (
          <div className={`stock-status-pill ${stockStatus.className}`}>
            {stockStatus.text}: {stockInfo.stock}
          </div>
        )}

        <div className="product-actions">
          <button
            className="action-btn buy-now-btn"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            Buy Now
          </button>
          <button
            className="action-btn add-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <span className="material-icons btn-icon">shopping_cart</span>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);