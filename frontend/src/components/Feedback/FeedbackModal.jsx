import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import './FeedbackModal.css';

const RATING_CATEGORIES = [
  { id: 'overall', label: 'Overall Experience', icon: '⭐' },
  { id: 'design', label: 'Website Design', icon: '🎨' },
  { id: 'navigation', label: 'Ease of Navigation', icon: '🧭' },
  { id: 'products', label: 'Product Quality', icon: '🛍️' },
  { id: 'performance', label: 'Website Performance', icon: '⚡' },
  { id: 'support', label: 'Customer Support', icon: '🤝' }
];

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

const FeedbackModal = ({ isOpen, onClose, user }) => {
  const [ratings, setRatings] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const handleRatingChange = (category, rating) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const feedbackData = {
        userId: user?.id || null,
        userEmail: user?.email || null,
        ratings,
        feedback,
        suggestions,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      };

      // Submit feedback to backend
      await api.submitFeedback(feedbackData);
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setRatings({});
        setFeedback('');
        setSuggestions('');
        setSelectedCategory('overall');
        setSubmitStatus(null);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOverallRating = () => {
    const values = Object.values(ratings);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, rating) => sum + rating, 0) / values.length);
  };

  const isFormValid = () => {
    return Object.keys(ratings).length > 0 && ratings.overall;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="feedback-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="feedback-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="feedback-header">
            <div className="feedback-title">
              <h2>Rate Your Experience</h2>
              <p>Help us improve by sharing your feedback</p>
            </div>
            <button className="feedback-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {submitStatus && (
              <motion.div
                className={`feedback-status ${submitStatus}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {submitStatus === 'success' ? (
                  <>
                    <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Thank you for your feedback!</span>
                  </>
                ) : (
                  <>
                    <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Failed to submit feedback. Please try again.</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="feedback-form">
            {/* Category Tabs */}
            <div className="feedback-categories">
              {RATING_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Rating Section */}
            <div className="feedback-rating-section">
              <h3>{RATING_CATEGORIES.find(c => c.id === selectedCategory)?.label}</h3>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={`rating-star ${ratings[selectedCategory] >= rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(selectedCategory, rating)}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
                {ratings[selectedCategory] && (
                  <span className="rating-label">
                    {RATING_LABELS[ratings[selectedCategory]]}
                  </span>
                )}
              </div>
            </div>

            {/* Overall Rating Display */}
            {Object.keys(ratings).length > 0 && (
              <motion.div
                className="overall-rating"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="overall-rating-display">
                  <span className="overall-label">Overall Rating:</span>
                  <div className="overall-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`overall-star ${getOverallRating() >= star ? 'active' : ''}`}
                      >
                        ⭐
                      </span>
                    ))}
                    <span className="overall-score">{getOverallRating()}/5</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Text Feedback */}
            <div className="feedback-text-section">
              <div className="feedback-text-group">
                <label htmlFor="feedback">Additional Comments (Optional)</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={3}
                />
              </div>

              <div className="feedback-text-group">
                <label htmlFor="suggestions">Suggestions for Improvement (Optional)</label>
                <textarea
                  id="suggestions"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="How can we make your experience better?"
                  rows={3}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="feedback-actions">
              <button
                type="button"
                className="feedback-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="feedback-submit"
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackModal;

