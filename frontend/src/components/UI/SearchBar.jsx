import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SearchBar.css';

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  debounceMs = 300,
  className = "",
  showClearButton = true,
  size = "medium" // small, medium, large
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, debounceMs, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-3 text-base",
    large: "px-5 py-4 text-lg"
  };

  const iconSizes = {
    small: "w-4 h-4",
    medium: "w-5 h-5", 
    large: "w-6 h-6"
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`relative flex items-center bg-white border rounded-lg transition-all duration-200 ${
          isFocused 
            ? 'border-green-500 shadow-lg shadow-green-100' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Search Icon */}
        <div className="absolute left-3 text-gray-400 pointer-events-none">
          <svg 
            className={`${iconSizes[size]} transition-colors duration-200 ${
              isFocused ? 'text-green-500' : 'text-gray-400'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-400 ${sizeClasses[size]} pl-10 pr-10`}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {showClearButton && searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              type="button"
            >
              <svg 
                className={`${iconSizes[size]}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search Results Count (if provided) */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 text-center"
        >
          {searchQuery && `Searching for "${searchQuery}"...`}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;
