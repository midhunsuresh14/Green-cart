import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  // Plant data for the showcase
  const plants = [
    {
      id: 1,
      name: 'Crassula Ovata',
      image: 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=300&h=300&q=80',
      alt: 'Jade Plant'
    },
    {
      id: 2,
      name: 'Haworthiopsis Attenuata',
      image: 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=300&h=300&q=80',
      alt: 'Zebra Plant'
    },
    {
      id: 3,
      name: 'Browningia Hertlingiana',
      image: 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=300&h=300&q=80',
      alt: 'Blue Torch Cactus'
    },
    {
      id: 4,
      name: 'Chlorophytum Comosum',
      image: 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=300&h=300&q=80',
      alt: 'Spider Plant'
    },
    {
      id: 5,
      name: 'Monstera Deliciosa',
      image: 'https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=300&h=300&q=80',
      alt: 'Swiss Cheese Plant'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <motion.nav 
        className="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="nav-container">
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/plant-finder" className="nav-link">Plant Finder</Link>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/about" className="nav-link">About us</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/my-plants" className="nav-link">My Plants</Link>
          </div>
          <div className="nav-icons">
            <div className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Side - Plant Card */}
          <motion.div 
            className="hero-plant-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="plant-image-container">
              <img 
                src="https://images.unsplash.com/photo-1509423350716-97f2360af5e4?auto=format&fit=crop&w=500&h=600&q=80" 
                alt="Dracaena Trifasciata" 
                className="plant-image"
              />
            </div>
            <div className="plant-info">
              <h3 className="plant-name">Dracaena Trifasciata</h3>
              <p className="plant-description">One of the most effective houseplants in air purification.</p>
              <button className="know-more-btn">Know more →</button>
            </div>
          </motion.div>

          {/* Right Side - Hero Text */}
          <motion.div 
            className="hero-text-block"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span 
              className="hero-subtitle"
              variants={itemVariants}
            >
              Go green.
            </motion.span>
            <motion.h1 
              className="hero-title"
              variants={itemVariants}
            >
              The world of plants
            </motion.h1>
            <motion.p 
              className="hero-description"
              variants={itemVariants}
            >
              Discover everything you need to know about your plants, treat them with kindness and they will take care of you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="product-showcase">
        <motion.div 
          className="showcase-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="showcase-title">Top 5 of the week</h2>
          <div className="plants-grid">
            {plants.map((plant, index) => (
              <motion.div
                key={plant.id}
                className="plant-card"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="plant-card-image">
                  <img src={plant.image} alt={plant.alt} />
                </div>
                <h3 className="plant-card-name">{plant.name}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;