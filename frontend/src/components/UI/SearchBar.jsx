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
    <div className={`relative w-full ${className}`}>
      <motion.div
        className={`relative flex items-center bg-white rounded-xl transition-all duration-300 ${isFocused
          ? 'shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-transparent ring-2 ring-green-500/20'
          : 'shadow-sm border border-gray-200 hover:border-green-400/50 hover:shadow-md'
          }`}
        whileTap={{ scale: 0.995 }}
      >
        {/* Search Icon */}
        <div className={`absolute left-4 pointer-events-none transition-colors duration-300 ${isFocused ? 'text-green-600' : 'text-gray-400'
          }`}>
          <svg
            className="w-6 h-6"
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
          className={`w-full bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400 pl-12 pr-12 py-4 text-lg font-medium rounded-xl`}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {showClearButton && searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.05)' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors duration-200"
              type="button"
            >
              <svg
                className="w-5 h-5"
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

      {/* Search Results Indicator */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="absolute top-full left-0 right-0 mt-2 px-4 text-sm text-gray-500 font-medium overflow-hidden"
          >
            Searching for <span className="text-green-600">"{searchQuery}"</span>...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
