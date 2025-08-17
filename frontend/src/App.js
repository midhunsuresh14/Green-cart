import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import DatabaseStatus from './components/Admin/DatabaseStatus';

function NavBar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/istockphoto-1263328016-612x612.jpg" alt="GreenCart Logo" className="navbar-logo-img" />
        GreenCart
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link"><span className="material-icons">home</span>Home</Link>
        <Link to="/about" className="nav-link"><span className="material-icons">info</span>About</Link>
        <Link to="/contact" className="nav-link"><span className="material-icons">contact_mail</span>Contact</Link>
        <Link to="/cart" className="nav-link"><span className="material-icons">shopping_cart</span>Cart</Link>
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link"><span className="material-icons">dashboard</span>Dashboard</Link>
            <button className="nav-btn" onClick={onLogout}><span className="material-icons">logout</span>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link"><span className="material-icons">login</span>Login</Link>
            <Link to="/signup" className="nav-link"><span className="material-icons">person_add</span>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

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

function About() {
  return <div className="page-content"><h2>About GreenCart</h2><p>GreenCart is your smart agriculture and herbal health platform. More info coming soon!</p></div>;
}
function Contact() {
  return <div className="page-content"><h2>Contact Us</h2><p>Contact form and details coming soon!</p></div>;
}
function Cart() {
  return <div className="page-content"><h2>Your Cart</h2><p>Cart functionality coming soon!</p></div>;
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login user={user} setUser={setUser} />} />
        <Route path="/signup" element={<Signup user={user} setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/db-status" element={<DatabaseStatus />} />
      </Routes>
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
