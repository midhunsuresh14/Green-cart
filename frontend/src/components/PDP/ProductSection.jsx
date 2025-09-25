import React, { useState, useEffect } from 'react';

export default function ProductSection({ product, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [stockInfo, setStockInfo] = useState({ stock: 0, inStock: true });
  const [loading, setLoading] = useState(false);
  
  // Helper function to resolve image URLs
  const resolveImageUrl = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
    const host = apiBase.replace(/\/api\/?$/, '');
    return src.startsWith('/') ? host + src : host + '/' + src;
  };

  // Get primary image URL with fallback
  const getPrimaryImageUrl = () => {
    const raw = product?.imageUrl || product?.image || product?.image_path || product?.imagePath || product?.thumbnail || product?.photo || product?.photoUrl || product?.url;
    return resolveImageUrl(raw) || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
  };

  // Create images array with proper URL resolution
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => resolveImageUrl(img) || img).filter(Boolean)
    : [getPrimaryImageUrl()];

  // Fetch stock information when component mounts
  useEffect(() => {
    const fetchStockInfo = async () => {
      if (!product.id && !product._id) return;
      
      try {
        const productId = product.id || product._id;
        const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const response = await fetch(`${apiBase}/products/${productId}/stock`);
        
        if (response.ok) {
          const data = await response.json();
          setStockInfo(data);
        }
      } catch (error) {
        console.error('Error fetching stock info:', error);
      }
    };

    fetchStockInfo();
  }, [product.id, product._id]);

  // Check availability before changing quantity
  const checkAvailability = async (newQty) => {
    if (!product.id && !product._id) return true;
    
    try {
      const productId = product.id || product._id;
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const response = await fetch(`${apiBase}/products/${productId}/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
    return false;
  };

  const inc = async () => {
    const newQty = qty + 1;
    if (newQty <= stockInfo.stock) {
      const available = await checkAvailability(newQty);
      if (available) {
        setQty(newQty);
      }
    }
  };

  const dec = () => setQty((q) => Math.max(1, q - 1));

  const handleAddToCart = async () => {
    if (!stockInfo.inStock) {
      alert('This product is currently out of stock');
      return;
    }

    const available = await checkAvailability(qty);
    if (!available) {
      alert(`Only ${stockInfo.stock} items available in stock`);
      return;
    }

    setLoading(true);
    try {
      onAddToCart({ ...product, quantity: qty, finalPrice: product.price });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: images */}
      <div>
        <div className="aspect-square border rounded-xl bg-white grid place-items-center overflow-hidden">
          <img 
            src={images[selectedImage]} 
            alt={product.name} 
            className="object-contain max-h-full" 
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button key={i} onClick={() => setSelectedImage(i)} className={`h-16 w-16 flex-shrink-0 border rounded-lg overflow-hidden ${selectedImage===i?'ring-2 ring-green-600':''}`}>
              <img 
                src={src} 
                alt="thumb" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Right: details */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= Math.round(product.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-gray-500">{product.rating || 0} ({product.reviews || 0} reviews)</span>
        </div>
        
        {/* Stock Status */}
        <div className="mt-3">
          {stockInfo.inStock ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-green-700">In Stock ({stockInfo.stock} available)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-red-700">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          <div className="text-2xl font-bold">₹{(product.price * qty).toFixed(0)}</div>
          {product.originalPrice && (
            <div className="text-gray-400 line-through">₹{(product.originalPrice * qty).toFixed(0)}</div>
          )}
          {product.discount && (
            <span className="px-2 py-0.5 text-xs rounded bg-red-50 text-red-700">-{product.discount}%</span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button 
            onClick={dec} 
            disabled={qty <= 1}
            className="h-8 w-8 grid place-items-center border rounded disabled:opacity-50"
          >
            -
          </button>
          <div className="px-3 text-sm font-medium">{qty}</div>
          <button 
            onClick={inc} 
            disabled={qty >= stockInfo.stock || !stockInfo.inStock}
            className="h-8 w-8 grid place-items-center border rounded disabled:opacity-50"
          >
            +
          </button>
          <span className="text-xs text-gray-500 ml-2">Max: {stockInfo.stock}</span>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            className={`flex-1 rounded-lg py-2 font-semibold transition ${
              stockInfo.inStock && !loading
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleAddToCart}
            disabled={!stockInfo.inStock || loading}
          >
            {loading ? 'Adding...' : stockInfo.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button 
            className={`flex-1 border rounded-lg py-2 font-semibold transition ${
              stockInfo.inStock
                ? 'border-green-600 text-green-700 hover:bg-green-50'
                : 'border-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!stockInfo.inStock}
          >
            Buy Now
          </button>
        </div>

        {/* Offers */}
        <div className="mt-5 p-3 border rounded-lg bg-green-50">
          <div className="font-semibold mb-1">Offers & Gift Cards</div>
          <ul className="text-sm text-gray-700 list-disc pl-5">
            <li>Flat 10% off on orders above ₹999</li>
            <li>Free delivery above ₹499</li>
          </ul>
        </div>

        {/* Delivery PIN & Gift */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <div className="text-sm font-medium mb-1">Check Delivery</div>
            <div className="flex gap-2">
              <input className="flex-1 border rounded px-2 py-1" placeholder="Enter PIN" />
              <button className="px-3 py-1 bg-gray-900 text-white rounded">Check</button>
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" />
              <span className="text-sm">Make this a gift</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
