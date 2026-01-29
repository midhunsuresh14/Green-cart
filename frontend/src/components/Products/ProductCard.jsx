import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Zap, Star } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetails, onToggleWishlist, isInWishlist }) => {
  const navigate = useNavigate();
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

  const isOutOfStock = !stockInfo.inStock;

  // Get base URL for API requests
  const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
  };

  // Handle image URL construction and fallback
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';

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
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
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
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="group bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-green-900/10 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col relative overflow-hidden">

      {/* Image Section */}
      <div className="relative h-64 overflow-hidden rounded-t-[2rem] bg-slate-50">
        <Link to={`/pdp/${product.id}`} onClick={() => onViewDetails(product)} className="block w-full h-full">
          <img
            src={getImageUrl(product.imageUrl || product.image_url || product.image)}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${isInWishlist
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white'
            }`}
          onClick={() => onToggleWishlist(product)}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Badge */}
        {!loadingStock && stockInfo.stock < 10 && stockInfo.stock > 0 && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-amber-100/90 backdrop-blur-sm text-amber-700 text-xs font-bold rounded-full border border-amber-200/50">
            Low Stock: {stockInfo.stock} left
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/pdp/${product.id}`} className="block mb-2 group-hover:text-[#2F6C4E] transition-colors">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating Placeholder (Static for now) */}
        <div className="flex items-center gap-1 mb-4">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">(4.8)</span>
        </div>

        <div className="flex items-center justify-between mt-auto mb-5">
          <div>
            <span className="text-2xl font-black text-slate-900">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-green-50 text-[#2F6C4E] hover:bg-green-100 border border-green-100'
              }`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>

          <button
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg shadow-green-900/10 ${isOutOfStock
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-[#2F6C4E] text-white hover:bg-[#24553d] hover:shadow-xl hover:-translate-y-0.5'
              }`}
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}
            disabled={isOutOfStock}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);