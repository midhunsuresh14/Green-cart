import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import ProductCard from './Products/ProductCard';

const Wishlist = ({ wishlistItems = [], onRemoveFromWishlist, onAddToCart, user }) => {
  const navigate = useNavigate();

  // Helper to handle product details navigation
  const handleViewDetails = (product) => {
    navigate(`/pdp/${product.id}`);
  };

  // Helper to check if item is in wishlist (always true here, but required for ProductCard prop compatibility)
  const isInWishlist = () => true;

  if (wishlistItems.length === 0) {
    return (
      <motion.div
        className="min-h-screen bg-[#FDFCF8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Simple Hero for consistency even when empty */}
        <div className="bg-[#2F6C4E] pt-24 pb-16 px-4 rounded-b-[3rem] shadow-lg mb-12">
          <div className="max-w-7xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">My Wishlist</h1>
            <p className="text-white/80 font-medium">0 items saved</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 text-center">
          <motion.div
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Heart className="w-10 h-10 text-[#2F6C4E] fill-[#2F6C4E]/20" />
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">Your wishlist is empty</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Looks like you haven't saved any plants yet. Browse our collection and click the heart icon to save your favorites!
          </p>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#2F6C4E] text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 hover:bg-[#24553d] hover:-translate-y-1 transition-all duration-300"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Premium Hero Section */}
      <div className="bg-[#2F6C4E] pt-24 pb-20 px-4 rounded-b-[3rem] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-white gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 opacity-80 text-sm font-bold tracking-wide uppercase">
              <ShoppingBag className="w-4 h-4" />
              <span>Your Saved Items</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">My Wishlist</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex flex-col items-center">
              <span className="text-3xl font-black">{wishlistItems.length}</span>
              <span className="text-xs uppercase tracking-wider font-medium opacity-80">Items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard
                  product={product}
                  user={user}
                  onAddToCart={onAddToCart}
                  onViewDetails={() => handleViewDetails(product)}
                  onToggleWishlist={() => onRemoveFromWishlist(product.id)}
                  isInWishlist={true} // Always true since we are in wishlist
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
