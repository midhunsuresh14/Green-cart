import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import './App.css';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import DatabaseStatus from './components/Admin/DatabaseStatus';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProductListing from './components/Products/ProductListing';
import ProductDetail from './components/Products/ProductDetail';
import ShoppingCart from './components/Cart/ShoppingCart';
import Checkout from './components/Checkout/Checkout';
import UserProfile from './components/Profile/UserProfile';
import About from './components/Static/About';
import Contact from './components/Static/Contact';
import HomeMUI from './components/HomeMUI';
import NavbarMUI from './components/NavbarMUI';
import CartDrawer from './components/Cart/CartDrawer';
import AdminNavbar from './components/Admin/AdminNavbar';
import Wishlist from './components/Wishlist';
import HerbalRemedies from './components/HerbalRemedies/HerbalRemedies';
import PDPPage from './components/PDP/PDPPage.jsx';
import ChatBot from './components/ChatBot'; // Import the ChatBot component

// Lazy load category pages to keep bundle light
const CategoriesPageLazy = React.lazy(() => import('./components/Products/CategoriesPage'));
const SubcategoriesPageLazy = React.lazy(() => import('./components/Products/SubcategoriesPage'));

// Replaced legacy NavBar with MUI NavbarMUI

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content home-hero fade-in">
          <div className="hero-images">
            <img src="/istockphoto-1263328016-612x612.jpg" alt="GreenCart Logo" className="hero-img single-hero-img" />
          </div>
          <div className="hero-text">
            <div className="hero-logo">
              <img src="/istockphoto-1263328016-612x612.jpg" alt="GreenCart Logo" className="hero-logo-img" />
            </div>
            <h1>GreenCart</h1>
            <h2>Grow Smart. Live Green.</h2>
            <p>
              Discover, identify, and buy medicinal plants.<br/>
              Get AI-powered crop suggestions and herbal remedies.<br/>
              Join the green revolution for a healthier tomorrow!
            </p>
            <div className="hero-buttons">
              <a href="#features" className="landing-btn">Explore Features</a>
              <a href="#how-it-works" className="landing-btn secondary">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose GreenCart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-icons">camera_alt</span>
              </div>
              <h3>AI Plant Identification</h3>
              <p>Upload a photo and instantly identify plants with our advanced AI technology. Get detailed information about medicinal properties and care instructions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-icons">wb_sunny</span>
              </div>
              <h3>Weather-Based Suggestions</h3>
              <p>Get personalized crop recommendations based on your location's weather patterns. Plan your garden with precision.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-icons">local_pharmacy</span>
              </div>
              <h3>Herbal Remedies</h3>
              <p>Discover natural treatments for common ailments. Our AI suggests plant-based remedies with verified health benefits.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-icons">shopping_basket</span>
              </div>
              <h3>Verified Products</h3>
              <p>Shop from a curated selection of organic plants and herbal products. All items are verified for quality and authenticity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How GreenCart Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Upload & Identify</h3>
              <p>Take a photo of any plant and upload it to our AI system for instant identification.</p>
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=300&q=80" alt="Plant identification" className="step-image" />
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Get Recommendations</h3>
              <p>Receive personalized suggestions for crops, remedies, and care based on your location and needs.</p>
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80" alt="Crop recommendations" className="step-image" />
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Shop & Grow</h3>
              <p>Purchase verified plants and products from our marketplace and start your green journey.</p>
              <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&q=80" alt="Shopping and growing" className="step-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Plants Identified</p>
            </div>
            <div className="stat-item">
              <h3>5,000+</h3>
              <p>Happy Users</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Verified Products</p>
            </div>
            <div className="stat-item">
              <h3>95%</h3>
              <p>Accuracy Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>GreenCart</h4>
              <p>Your smart agriculture and herbal health platform. Grow smart, live green.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li>Plant Identification</li>
                <li>Crop Recommendations</li>
                <li>Herbal Remedies</li>
                <li>E-commerce</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>Email: info@greencart.com</p>
              <p>Phone: +91 98765 43210</p>
              <p>Address: GreenTech Park, Bangalore</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 GreenCart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Dashboard({ user }) {
  return (
    <div className="page-content">
      <h2>Welcome to GreenCart Dashboard</h2>
      {user && (
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p>You have successfully logged in to your GreenCart account!</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const getWishlistKey = () => {
    const storedUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null);
    const userIdentifier = storedUser?.id || storedUser?.email || 'guest';
    return `wishlist:${userIdentifier}`;
  };

  const getCartKey = (currentUser = user) => {
    if (!currentUser) return 'cart:guest';
    const userIdentifier = currentUser.id || currentUser.email || 'guest';
    return `cart:${userIdentifier}`;
  };

  const saveCart = (items, currentUser = user) => {
    try {
      localStorage.setItem(getCartKey(currentUser), JSON.stringify(items || []));
    } catch (_) {}
  };

  const normalizeProduct = (p) => {
    if (!p) return null;
    const id = p.id != null ? String(p.id) : undefined;
    return {
      id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      category: p.category,
      subcategory: p.subcategory,
      imageUrl: p.imageUrl,
      image: p.image,
      description: p.description,
      rating: p.rating,
      reviews: p.reviews,
      popularity: p.popularity,
      isNew: p.isNew,
    };
  };

  useEffect(() => {
    // One-time cleanup of problematic cart data
    const cleanup = localStorage.getItem('cart-cleanup-done');
    if (!cleanup) {
      // Clear all existing cart data to fix cross-user contamination
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cart:') || key === 'cart') {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('cart-cleanup-done', 'true');
    }

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      // If just signed up, show welcome and clean the flag
      const justSignedUp = localStorage.getItem('justSignedUp');
      if (justSignedUp) {
        setToast({ open: true, type: 'success', message: `Welcome to GreenCart!` });
        localStorage.removeItem('justSignedUp');
      }
    }
  }, []);

  // Load cart whenever the user changes (with migration and guest merge)
  useEffect(() => {
    try {
      // Migrate legacy global key if present
      const legacy = localStorage.getItem('cart');
      if (legacy) {
        localStorage.setItem('cart:guest', legacy);
        localStorage.removeItem('cart');
      }

      const userKey = getCartKey(user);
      const guestKey = 'cart:guest';

      if (user) {
        // User is logged in - load their cart and merge any guest cart
        const guest = JSON.parse(localStorage.getItem(guestKey) || '[]');
        const current = JSON.parse(localStorage.getItem(userKey) || '[]');
        
        // Only merge if there are guest items
        if (guest.length > 0) {
          const map = new Map();
          [...current, ...guest].forEach((p) => {
            if (!p || p.id == null) return;
            const id = String(p.id);
            if (!map.has(id)) {
              map.set(id, { ...p, quantity: Number(p.quantity) || 1 });
            } else {
              const prev = map.get(id);
              map.set(id, { ...prev, quantity: (Number(prev.quantity) || 1) + (Number(p.quantity) || 1) });
            }
          });
          const merged = Array.from(map.values());
          localStorage.setItem(userKey, JSON.stringify(merged));
          localStorage.removeItem(guestKey); // Clear guest cart after merge
          setCartItems(merged);
        } else {
          // No guest cart to merge, just load user's cart
          setCartItems(current);
        }
      } else {
        // No user logged in - load guest cart only
        const guest = JSON.parse(localStorage.getItem(guestKey) || '[]');
        setCartItems(guest);
      }
    } catch (_) {
      setCartItems([]);
    }
  }, [user]);

  // Load wishlist whenever the user changes (with migration and guest merge)
  useEffect(() => {
    try {
      // Migrate legacy global key if present
      const legacy = localStorage.getItem('wishlist');
      if (legacy) {
        // Move legacy to guest bucket first to avoid showing previous user's data
        localStorage.setItem('wishlist:guest', legacy);
        localStorage.removeItem('wishlist');
      }

      const userKey = getWishlistKey();
      const guestKey = 'wishlist:guest';

      if (user) {
        const guest = JSON.parse(localStorage.getItem(guestKey) || '[]');
        const current = JSON.parse(localStorage.getItem(userKey) || '[]');
        // Merge unique by id
        const map = new Map();
        [...current, ...guest].forEach((p) => {
          if (p && (p.id != null)) map.set(p.id, p);
        });
        const merged = Array.from(map.values());
        localStorage.setItem(userKey, JSON.stringify(merged));
        localStorage.removeItem(guestKey);
        setWishlistItems(merged);
      } else {
        const guest = JSON.parse(localStorage.getItem(guestKey) || '[]');
        setWishlistItems(guest);
      }
    } catch (_) {
      setWishlistItems([]);
    }
  }, [user]);

  // If an admin lands on home, take them to dashboard
  useEffect(() => {
    if (user?.role === 'admin' && location.pathname === '/') {
      navigate('/admin', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = async () => {
    // Save current user's cart before logout
    if (user && cartItems.length > 0) {
      saveCart(cartItems, user);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state immediately - don't move to guest cart
    setUser(null);
    setWishlistItems([]);
    setCartItems([]); // This will trigger the useEffect to load guest cart (which should be empty)
    navigate('/');
  };

  const handleAddToCart = async (product) => {
    // Check stock availability before adding to cart
    try {
      const productId = product.id || product._id;
      const requestedQty = product.quantity || 1;
      
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const response = await fetch(`${apiBase}/products/${productId}/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: requestedQty })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!data.available) {
          setToast({
            open: true,
            type: 'error',
            message: `Only ${data.maxAvailable} items available in stock`
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking stock:', error);
    }

    setCartItems((prev) => {
      const id = product.id;
      const existingIndex = prev.findIndex((p) => p.id === id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + (product.quantity || 1),
          finalPrice: product.finalPrice || product.price,
        };
        saveCart(updated);
        return updated;
      }
      const next = [
        ...prev,
        {
          ...product,
          quantity: product.quantity || 1,
          finalPrice: product.finalPrice || product.price,
        },
      ];
      saveCart(next);
      return next;
    });
    setIsCartOpen(true);
    setToast({
      open: true,
      type: 'success',
      message: 'Product added to cart!'
    });
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    // Check stock availability before updating quantity
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      const response = await fetch(`${apiBase}/products/${itemId}/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!data.available) {
          setToast({
            open: true,
            type: 'error',
            message: `Only ${data.maxAvailable} items available in stock`
          });
          // Update to maximum available quantity
          setCartItems((prev) => {
            const next = prev.map((item) => (item.id === itemId ? { ...item, quantity: data.maxAvailable } : item));
            saveCart(next);
            return next;
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking stock:', error);
    }

    setCartItems((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item));
      saveCart(next);
      return next;
    });
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      saveCart(next);
      return next;
    });
  };

  const handleClearCart = () => {
    setCartItems(() => {
      saveCart([]);
      return [];
    });
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    navigate('/product');
  };

  const handleOrderComplete = (order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems(() => { saveCart([]); return []; });
    navigate('/profile');
  };

  const handleToggleWishlist = (product) => {
    const normalized = normalizeProduct(product);
    if (!normalized || !normalized.id) return;
    setWishlistItems((prev) => {
      const isInWishlist = prev.some((item) => String(item.id) === String(normalized.id));
      let updatedWishlist;

      if (isInWishlist) {
        updatedWishlist = prev.filter((item) => String(item.id) !== String(normalized.id));
      } else {
        updatedWishlist = [...prev, normalized];
      }
      try {
        localStorage.setItem(getWishlistKey(), JSON.stringify(updatedWishlist));
      } catch (_) {}

      // Show user feedback
      setToast({
        open: true,
        type: isInWishlist ? 'info' : 'success',
        message: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
      });

      return updatedWishlist;
    });
  };

  const handleBuyNow = (product) => {
    // Add product to cart first
    handleAddToCart(product);
    // Then navigate directly to checkout
    setTimeout(() => {
      navigate('/checkout');
    }, 100);
    setToast({
      open: true,
      type: 'success',
      message: 'Proceeding to checkout...'
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    const idStr = String(productId);
    setWishlistItems((prev) => {
      const updatedWishlist = prev.filter((item) => String(item.id) !== idStr);
      try {
        localStorage.setItem(getWishlistKey(), JSON.stringify(updatedWishlist));
      } catch (_) {}
      return updatedWishlist;
    });
  };

  return (
    <>
      {location.pathname.startsWith('/admin') ? (
        <AdminNavbar user={user} onLogout={handleLogout} />
      ) : (
        <NavbarMUI user={user} onLogout={handleLogout} wishlistItems={wishlistItems} cartCount={cartItems.reduce((s,i)=>s+(i.quantity||1),0)} onOpenCart={()=>setIsCartOpen(true)} />
      )}

      <main>
        <Routes>
          <Route path="/" element={<HomeMUI />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/products" element={
            <ProductListing 
              user={user}
              onAddToCart={handleAddToCart} 
              onViewDetails={(product) => {
                setSelectedProduct(product);
                navigate(`/pdp/${product.id}`);
              }} 
              onToggleWishlist={handleToggleWishlist} 
              wishlistItems={wishlistItems} 
            />
          } />
          <Route path="/categories" element={<React.Suspense fallback={<div />}> <CategoriesPageLazy /> </React.Suspense>} />
          <Route path="/categories/:categoryKey" element={<React.Suspense fallback={<div />}> <SubcategoriesPageLazy /> </React.Suspense>} />
          <Route path="/product" element={<ProductDetail product={selectedProduct} onAddToCart={handleAddToCart} onBack={() => navigate(-1)} onToggleWishlist={handleToggleWishlist} isInWishlist={wishlistItems.some((w)=> String(w.id)===String(selectedProduct?.id))} />} />
          <Route path="/pdp/:productId" element={
            <PDPPage 
              user={user} 
              onAddToCart={handleAddToCart} 
              onOpenCart={() => setIsCartOpen(true)} 
            />
          } />
          <Route path="/cart" element={<ShoppingCart cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onClearCart={handleClearCart} />} />
          <Route path="/checkout" element={<Checkout cartItems={cartItems} onOrderComplete={handleOrderComplete} />} />
          <Route path="/wishlist" element={<Wishlist wishlistItems={wishlistItems} onRemoveFromWishlist={handleRemoveFromWishlist} onAddToCart={handleAddToCart} onViewDetails={handleViewDetails} />} />
          <Route path="/profile" element={<UserProfile user={user} orders={orders} />} />
          <Route path="/remedies" element={<HerbalRemedies />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login user={user} setUser={setUser} />} />
          <Route path="/signup" element={<Signup user={user} setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/db-status" element={<DatabaseStatus />} />
        </Routes>

        {/* Global toast for wishlist feedback */}
        <Snackbar
          open={toast.open}
          autoHideDuration={2200}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setToast((t) => ({ ...t, open: false }))}
            severity={toast.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </main>

      <CartDrawer
        open={isCartOpen}
        onClose={()=>setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={()=>{ setIsCartOpen(false); navigate('/checkout'); }}
      />
      
      {/* ChatBot Component */}
      <ChatBot />
    </>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}