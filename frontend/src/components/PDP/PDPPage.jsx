import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import ProductSection from './ProductSection.jsx';
import Recommendations from './Recommendations.jsx';
import Reviews from './Reviews.jsx';
import FooterPDP from './FooterPDP.jsx';
import ARView from './ARView.jsx'; // Import ARView component

const sampleProduct = {
  id: 'p1',
  name: 'Plant Food Fertilizer Stick - Green & Bloom',
  price: 499,
  originalPrice: 699,
  discount: 25,
  rating: 4.8,
  reviews: 48,
  description: 'Feed your plants with our premium plant food sticks. Rich in essential nutrients for healthy growth and vibrant blooms.',
  images: [
    'https://images.unsplash.com/photo-1621650489646-462b6f2208b5?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1618477388954-7852f540219f?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?auto=format&fit=crop&w=800&q=60',
  ],
};

// Function to manage recently viewed products in localStorage
const getRecentlyViewed = () => {
  try {
    const recentlyViewed = localStorage.getItem('recentlyViewedProducts');
    return recentlyViewed ? JSON.parse(recentlyViewed) : [];
  } catch (e) {
    console.error('Error reading recently viewed products from localStorage:', e);
    return [];
  }
};

const addRecentlyViewed = (product) => {
  try {
    const recentlyViewed = getRecentlyViewed();
    // Remove the product if it already exists in the list
    const filtered = recentlyViewed.filter(p => p.id !== product.id);
    // Add the product to the beginning of the list
    const updated = [product, ...filtered].slice(0, 10); // Keep only the last 10 products
    localStorage.setItem('recentlyViewedProducts', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving recently viewed product to localStorage:', e);
    return [];
  }
};

export default function PDPPage({ onAddToCart, onOpenCart, user }) {
  const { productId } = useParams();
  const [displayProduct, setDisplayProduct] = useState(sampleProduct);
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [productRating, setProductRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Fetch recent products (actually recently viewed products)
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoadingRecent(true);
        // Get recently viewed products from localStorage
        const recentlyViewed = getRecentlyViewed();
        setRecentProducts(recentlyViewed);
      } catch (error) {
        console.error('Error fetching recent products:', error);
        setRecentProducts([]);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecentProducts();
  }, []);

  // Fetch product data when component mounts or productId changes
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        console.log('No productId provided, using sample data');
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Fetching product with ID:', productId);
      try {
        // Use the public products endpoint to fetch the product
        console.log('Calling api.listProductsPublic with:', `/${productId}`);
        const productData = await api.listProductsPublic(`/${productId}`);
        console.log('API Response:', productData);

        if (productData) {
          console.log('Product data received:', productData);
          setDisplayProduct(productData);
          setProductRating(productData.rating || 0);
          setReviewCount(productData.reviews || 0);

          // Add this product to recently viewed
          console.log('Adding product to recently viewed');
          addRecentlyViewed(productData);

          // Update the recently viewed display
          const updatedRecentlyViewed = getRecentlyViewed();
          console.log('Updated recently viewed:', updatedRecentlyViewed);
          setRecentProducts(updatedRecentlyViewed.filter(p => p.id !== productData.id)); // Exclude current product
        } else {
          // Fallback to sample data if product not found
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to sample data on error
        const fallbackProduct = {
          ...sampleProduct,
          id: productId,
          name: `Product ${productId}`,
          description: 'Product details could not be loaded. This is a sample product description.'
        };
        setDisplayProduct(fallbackProduct);

        // Add fallback product to recently viewed
        addRecentlyViewed(fallbackProduct);

        // Update the recently viewed display
        const updatedRecentlyViewed = getRecentlyViewed();
        setRecentProducts(updatedRecentlyViewed.filter(p => p.id !== fallbackProduct.id)); // Exclude current product
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Initialize rating from reviews when component mounts
  useEffect(() => {
    if (displayProduct.rating !== undefined) {
      setProductRating(displayProduct.rating);
    }
    if (displayProduct.reviews !== undefined) {
      setReviewCount(displayProduct.reviews);
    }
  }, [displayProduct.id, displayProduct.rating, displayProduct.reviews]);

  // Function to update product rating when reviews change
  const handleRatingUpdate = (newRating, newReviewCount) => {
    console.log('Updating product rating:', newRating, 'reviews:', newReviewCount);
    setProductRating(newRating);
    setReviewCount(newReviewCount);
  };

  // Helper function to resolve image URLs
  const resolveImageUrl = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=60';
    if (/^https?:\/\//i.test(src)) return src;
    const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
    const host = apiBase.replace(/\/api\/?$/, '');
    return src.startsWith('/') ? host + src : host + '/' + src;
  };

  const getPrimaryImageUrl = (product) => {
    // Check for all possible image fields
    const raw = product?.imageUrl || product?.image || product?.image_path || product?.imagePath || product?.thumbnail || product?.photo || product?.photoUrl || product?.url;
    return resolveImageUrl(raw);
  };

  // Return loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Ensure the product has the required images array for the ProductSection component
  const productWithImages = {
    ...displayProduct,
    rating: productRating,
    reviews: reviewCount,
    images: displayProduct.images && displayProduct.images.length > 0
      ? displayProduct.images
      : [
        displayProduct.imageUrl || displayProduct.image || displayProduct.image_path ||
        displayProduct.imagePath || displayProduct.thumbnail || displayProduct.photo ||
        displayProduct.photoUrl || displayProduct.url || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60'
      ]
  };

  // Helper to resolve model URL
  const resolveModelUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'}${url}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductSection
        product={productWithImages}
        user={user}
        onAddToCart={(p) => { onAddToCart && onAddToCart(p); onOpenCart && onOpenCart(); }}
      />

      {/* AR View Demo Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-icons text-green-600">view_in_ar</span>
            <h2 className="text-lg font-bold text-gray-900">View in Your Space</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Not sure if this plant fits your spot? Use our Augmented Reality feature to see it in your room!
            (Demo: Using a sample 3D model)
          </p>
          <ARView
            modelUrl={resolveModelUrl(displayProduct.arModelUrl) || "https://modelviewer.dev/shared-assets/models/Astronaut.glb"}
            poster={getPrimaryImageUrl(displayProduct)}
            alt={`3D model of ${displayProduct.name}`}
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-base font-semibold mb-2">About the Product</h3>
        <p className="text-sm text-gray-700 bg-white border rounded-xl p-4">{displayProduct.description || "Feed your plants effortlessly with nutrient-rich sticks designed for flowering and green foliage. Easy to use, slow-release nutrition for thriving indoor and outdoor plants."}</p>
      </section>

      <Recommendations
        currentProductId={displayProduct.id}
        onAdd={(p) => { onAddToCart && onAddToCart({ ...p, quantity: 1 }); onOpenCart && onOpenCart(); }}
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
              No recently viewed products yet
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-xl bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white grid place-items-center">{String.fromCharCode(64 + i)}</div>
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