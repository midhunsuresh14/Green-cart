import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackModal from './FeedbackModal';
import './FeedbackButton.css';

const FeedbackButton = ({ user, position = 'bottom-left' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'feedback-btn-bottom-right',
    'bottom-left': 'feedback-btn-bottom-left',
    'top-right': 'feedback-btn-top-right',
    'top-left': 'feedback-btn-top-left'
  };

  // If we're using the navbar feedback button, we don't need to show this floating button
  if (!position) return null;

  return (
    <>
      <motion.button
        className={`feedback-button ${positionClasses[position]}`}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 1 // Delay to show after page load
        }}
      >
        <div className="feedback-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="feedback-tooltip"
              initial={{ opacity: 0, x: position.includes('right') ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: position.includes('right') ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              <span>Share Feedback</span>
              <div className="tooltip-arrow" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
    </>
  );
};

export default FeedbackButton;