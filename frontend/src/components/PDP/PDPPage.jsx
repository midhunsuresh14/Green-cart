import React, { useState, useEffect } from 'react';
import ProductSection from './ProductSection.jsx';
import Recommendations from './Recommendations.jsx';
import Reviews from './Reviews.jsx';
import FooterPDP from './FooterPDP.jsx';

const sampleProduct = {
  id: 'p1',
  name: 'Plant Food Fertilizer Stick - Green & Bloom',
  price: 499,
  originalPrice: 699,
  discount: 25,
  rating: 4.8,
  reviews: 48,
  images: [
    'https://images.unsplash.com/photo-1621650489646-462b6f2208b5?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1618477388954-7852f540219f?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?auto=format&fit=crop&w=800&q=60',
  ],
};

export default function PDPPage({ product, onAddToCart, onOpenCart, user }) {
  // Use the passed product or fall back to sample data
  const displayProduct = product || sampleProduct;
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [productRating, setProductRating] = useState(displayProduct.rating || 0);
  const [reviewCount, setReviewCount] = useState(displayProduct.reviews || 0);
  
  // Ensure the product has the required images array for the ProductSection component
  const productWithImages = {
    ...displayProduct,
    rating: productRating,
    reviews: reviewCount,
    images: displayProduct.images || [
      displayProduct.imageUrl || displayProduct.image || displayProduct.image_path || displayProduct.imagePath || displayProduct.thumbnail || displayProduct.photo || displayProduct.photoUrl || displayProduct.url || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60'
    ]
  };

  // Function to update product rating when reviews change
  const handleRatingUpdate = (newRating, newReviewCount) => {
    console.log('Updating product rating:', newRating, 'reviews:', newReviewCount);
    setProductRating(newRating);
    setReviewCount(newReviewCount);
  };

  // Initialize rating from reviews when component mounts
  useEffect(() => {
    if (displayProduct.rating !== undefined) {
      setProductRating(displayProduct.rating);
    }
    if (displayProduct.reviews !== undefined) {
      setReviewCount(displayProduct.reviews);
    }
  }, [displayProduct.id]);

  // Fetch recent products from API
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
        const response = await fetch(`${apiBase}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        // Get random 4 products for recently viewed
        const shuffled = data.sort(() => 0.5 - Math.random());
        setRecentProducts(shuffled.slice(0, 4));
      } catch (error) {
        console.error('Error fetching recent products:', error);
        setRecentProducts([]);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecentProducts();
  }, []);

  // Helper function to resolve image URLs
  const resolveImageUrl = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=60';
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
    <div className="min-h-screen bg-gray-50">
      <ProductSection product={productWithImages} onAddToCart={(p) => { onAddToCart && onAddToCart(p); onOpenCart && onOpenCart(); }} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-base font-semibold mb-2">About the Product</h3>
        <p className="text-sm text-gray-700 bg-white border rounded-xl p-4">{displayProduct.description || "Feed your plants effortlessly with nutrient-rich sticks designed for flowering and green foliage. Easy to use, slow-release nutrition for thriving indoor and outdoor plants."}</p>
      </section>

      <Recommendations 
        currentProductId={displayProduct.id} 
        onAdd={(p)=>{ onAddToCart && onAddToCart({ ...p, quantity: 1 }); onOpenCart && onOpenCart(); }} 
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-bold mb-2">Recently Viewed Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {loadingRecent ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border rounded-xl overflow-hidden bg-white animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-2">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : recentProducts.length > 0 ? (
            recentProducts.map((product) => (
              <div key={product.id} className="border rounded-xl overflow-hidden bg-white">
                <img 
                  alt={product.name} 
                  src={getPrimaryImageUrl(product)} 
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=60';
                  }}
                />
                <div className="p-2 text-sm">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-gray-700">₹{product.price}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No recent products available
            </div>
          )}
        </div>
      </section>

      <Reviews 
        productId={displayProduct.id || displayProduct._id} 
        user={user}
        onRatingUpdate={handleRatingUpdate}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-bold mb-2">From Happy Plant Parents</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {[1,2,3].map((i)=> (
            <div key={i} className="p-4 border rounded-xl bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white grid place-items-center">{String.fromCharCode(64+i)}</div>
                <div className="font-medium">Customer {i}</div>
              </div>
              <p className="text-sm text-gray-700">Amazing experience! Fast delivery and healthy plants. Packaging was great and the plants are thriving.</p>
            </div>
          ))}
        </div>
      </section>

      <FooterPDP />
    </div>
  );
}
