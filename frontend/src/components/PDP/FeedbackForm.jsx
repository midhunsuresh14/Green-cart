import React, { useState } from 'react';

export default function FeedbackForm({ productId, onSubmitFeedback, onClose, user }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (reviewText.trim().length < 10) {
      setError('Please write at least 10 characters in your review');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      console.log('Submitting review to:', `${apiBase}/reviews`);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('User:', user);
      console.log('Product ID:', productId);
      
      const response = await fetch(`${apiBase}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          reviewText: reviewText.trim(),
          userName: user.name || user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Review submission failed:', response.status, errorData);
        throw new Error(`Failed to submit review: ${response.status} - ${errorData}`);
      }

      const newReview = await response.json();
      
      // Call the callback to update the parent component
      if (onSubmitFeedback) {
        onSubmitFeedback(newReview);
      }
      
      // Reset form
      setRating(0);
      setReviewText('');
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.message.includes('You have already reviewed this product')) {
        setError('You have already reviewed this product. Each user can only submit one review per product.');
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`text-2xl transition-colors ${
            isActive ? 'text-yellow-500' : 'text-gray-300'
          } hover:text-yellow-400`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          ★
        </button>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Write a Review</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Rating Stars */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {renderStars()}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label htmlFor="reviewText" className="block text-sm font-medium mb-2">
                Your Review
              </label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reviewText.length}/500 characters
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
