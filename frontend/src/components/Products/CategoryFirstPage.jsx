import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sprout } from 'lucide-react';
import { fetchCategories } from './categoriesData';

const CategoryFirstPage = ({ onAddToCart, onViewDetails, onToggleWishlist, wishlistItems = [], user }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const backendCategories = await fetchCategories();
        setCategories(backendCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-slate-100 border-t-[#2F6C4E]"></div>
          <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
        <div className="bg-red-50 rounded-[2rem] p-8 text-center border border-red-100 max-w-md w-full">
          <p className="text-red-600 font-medium mb-4">Unable to load categories</p>
          <div className="text-sm text-red-400 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-20">
      {/* Premium Hero Section */}
      <div className="bg-[#2F6C4E] pt-24 pb-32 px-4 rounded-b-[4rem] shadow-xl relative z-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShoppingBag size={300} />
        </div>

        <div className="absolute top-10 left-10 opacity-5 pointer-events-none">
          <Sprout size={150} />
        </div>

        <motion.div
          className="max-w-7xl mx-auto text-center relative z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-green-50 mb-6 border border-white/20">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">Curated Collections</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tight leading-tight">
            Shop by <span className="text-green-300">Category</span>
          </h1>

          <p className="text-xl text-green-50/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Browse our carefully curated categories and discover exactly what you need for your green journey.
          </p>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((cat, index) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/products/${encodeURIComponent(cat.key)}`}
                className="group block relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 h-[320px] border border-slate-100"
              >
                {/* Image Background */}
                <div className="absolute inset-0">
                  <img
                    src={cat.imageUrl || cat.cover || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop'}
                    alt={cat.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop';
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-3xl font-black mb-2 leading-none tracking-tight">{cat.name}</h3>
                    <p className="text-white/80 line-clamp-2 mb-4 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {cat.description || 'Explore our premium selection of products in this category.'}
                    </p>

                    <div className="flex items-center gap-2 text-green-300 font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform duration-300">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Top Badge (Optional - can be used for item counts or specific tags if available) */}
                <div className="absolute top-6 right-6">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                    <ArrowRight className="w-5 h-5 -rotate-45" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryFirstPage;