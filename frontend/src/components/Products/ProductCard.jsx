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

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/pdp/${product.id}`} onClick={() => onViewDetails(product)}>
          {/* Fix: Use the correct image property and ensure it shows the actual uploaded image */}
          <img 
            src={getImageUrl(product.imageUrl || product.image_url || product.image)} 
            alt={product.name}
            onError={handleImageError}
            className="product-image"
            loading="lazy"
          />
        </Link>
        {!loadingStock && (
          <div className={`stock-badge ${stockStatus.className}`}>
            {stockStatus.text}
          </div>
        )}
        <button 
          className={`wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`}
          onClick={() => onToggleWishlist(product)}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          ♥
        </button>
      </div>
      <div className="product-details">
        <h3 className="product-name">
          <Link to={`/pdp/${product.id}`} onClick={() => onViewDetails(product)}>
            {product.name}
          </Link>
        </h3>
        <p className="product-description">{product.description?.substring(0, 60)}...</p>
        <div className="product-footer">
          <span className="product-price">₹{product.price?.toFixed(2)}</span>
          <button 
            className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`} 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);