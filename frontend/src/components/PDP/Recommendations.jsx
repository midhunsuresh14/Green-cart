import React, { useRef, useState, useEffect } from 'react';

// Function to get recently viewed products from localStorage
const getRecentlyViewed = () => {
  try {
    const recentlyViewed = localStorage.getItem('recentlyViewedProducts');
    return recentlyViewed ? JSON.parse(recentlyViewed) : [];
  } catch (e) {
    console.error('Error reading recently viewed products from localStorage:', e);
    return [];
  }
};

export default function Recommendations({ title = 'Plant Parents Also Picked', onAdd, currentProductId, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scroller = useRef(null);
  const scrollBy = (dx) => scroller.current && scroller.current.scrollBy({ left: dx, behavior: 'smooth' });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const response = await fetch(`${apiBase}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        
        // Get recently viewed product IDs to exclude them from recommendations
        const recentlyViewedIds = new Set(getRecentlyViewed().map(p => p.id));
        
        // Filter out current product and recently viewed products
        const filtered = data.filter(p => p.id !== currentProductId && !recentlyViewedIds.has(p.id));
        
        // If we don't have enough products after filtering, add some recently viewed ones
        let finalProducts = [...filtered];
        if (finalProducts.length < 10) {
          const recentlyViewed = getRecentlyViewed().filter(p => p.id !== currentProductId);
          finalProducts = [...finalProducts, ...recentlyViewed].slice(0, 10);
        }
        
        // Shuffle and get random 10 products
        const shuffled = finalProducts.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 10));
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to empty array
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentProductId]);

  // Handle add to cart with authentication check
  const handleAddToCart = (product) => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    
    onAdd && onAdd(product);
  };

  // Helper function to resolve image URLs
  const resolveImageUrl = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&q=60';
    if (/^https?:\/\//i.test(src)) return src;
    const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
    const host = apiBase.replace(/\/api\/?$/, '');
    return src.startsWith('/') ? host + src : host + '/' + src;
  };

  const getPrimaryImageUrl = (product) => {
    const raw = product?.imageUrl || product?.image || product?.image_path || product?.imagePath || product?.thumbnail || product?.photo || product?.photoUrl || product?.url;
    return resolveImageUrl(raw);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="hidden sm:flex gap-2">
          <button className="h-8 w-8 grid place-items-center border rounded" onClick={() => scrollBy(-320)}>‹</button>
          <button className="h-8 w-8 grid place-items-center border rounded" onClick={() => scrollBy(320)}>›</button>
        </div>
      </div>
      <div ref={scroller} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[220px] snap-start border rounded-xl overflow-hidden bg-white animate-pulse">
              <div className="h-36 bg-gray-200"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="min-w-[220px] snap-start border rounded-xl overflow-hidden bg-white">
              <div className="h-36 overflow-hidden">
                <img 
                  src={getPrimaryImageUrl(p)} 
                  alt={p.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&q=60';
                  }}
                />
              </div>
              <div className="p-3">
                <div className="font-medium truncate">{p.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-semibold">₹{p.price}</span>
                  {p.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                  )}
                  {p.discount && (
                    <span className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">-{p.discount}%</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-green-600 text-white rounded py-1.5 text-sm hover:bg-green-700" onClick={() => handleAddToCart(p)}>Add</button>
                  <button className="flex-1 border rounded py-1.5 text-sm hover:bg-gray-50">View</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full text-center py-8 text-gray-500">
            No recommendations available
          </div>
        )}
      </div>
    </section>
  );
}