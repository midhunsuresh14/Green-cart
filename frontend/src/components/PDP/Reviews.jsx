import React, { useState, useEffect } from 'react';
import FeedbackForm from './FeedbackForm.jsx';

export default function Reviews({ productId, user, onRatingUpdate }) {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Fallback data structure
  const defaultData = {
    average: 4.5,
    total: 0,
    bars: [
      { stars: 5, count: 0 },
      { stars: 4, count: 0 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
    items: [],
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
      console.log('Fetching reviews for product ID:', productId);
      const response = await fetch(`${apiBase}/reviews${productId ? `?productId=${productId}` : ''}`);
      
      if (!response.ok) {
        console.error('Reviews fetch failed:', response.status, response.statusText);
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      console.log('Reviews fetched successfully:', data);
      setReviewData(data);
      
      // Update parent component with the fetched rating data
      if (onRatingUpdate && data.average !== undefined && data.total !== undefined) {
        onRatingUpdate(data.average, data.total);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use default data with some sample reviews for better UX
      const fallbackData = {
        ...defaultData,
        average: 0,
        total: 0,
        bars: [
          { stars: 5, count: 0 },
          { stars: 4, count: 0 },
          { stars: 3, count: 0 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ],
        items: [],
      };
      setReviewData(fallbackData);
      
      // Update parent with fallback data
      if (onRatingUpdate) {
        onRatingUpdate(0, 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Function to handle new feedback submission
  const handleFeedbackSubmit = async (newReview) => {
    // Update the review data state with the new review
    setReviewData(prevData => {
      const updatedItems = [...prevData.items, newReview];
      const totalReviews = updatedItems.length;
      
      // Recalculate average rating
      const totalRating = updatedItems.reduce((sum, item) => sum + item.rating, 0);
      const newAverage = (totalRating / totalReviews).toFixed(1);
      
      // Recalculate rating bars
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      updatedItems.forEach(item => {
        if (item.rating >= 1 && item.rating <= 5) {
          ratingCounts[item.rating]++;
        }
      });
      
      const newBars = [
        { stars: 5, count: ratingCounts[5] },
        { stars: 4, count: ratingCounts[4] },
        { stars: 3, count: ratingCounts[3] },
        { stars: 2, count: ratingCounts[2] },
        { stars: 1, count: ratingCounts[1] },
      ];
      
      const updatedData = {
        ...prevData,
        items: updatedItems,
        total: totalReviews,
        average: parseFloat(newAverage),
        bars: newBars
      };
      
      // Update the parent component's rating display
      if (onRatingUpdate) {
        onRatingUpdate(parseFloat(newAverage), totalReviews);
      }
      
      return updatedData;
    });
    
    // Close the feedback form
    setShowFeedbackForm(false);
    
    // Refresh data from server after a short delay for consistency
    setTimeout(() => {
      fetchReviews();
    }, 500);
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-lg font-bold mb-3">Ratings & Reviews</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-xl bg-white animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-2 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                  <div className="w-6 h-2 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="p-4 border rounded-xl bg-white animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const data = reviewData || defaultData;
  const max = Math.max(...data.bars.map(b => b.count));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Ratings & Reviews</h2>
        {user ? (
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Write a Review
          </button>
        ) : (
          <div className="text-sm text-gray-500">
            Please login to write a review
          </div>
        )}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 border rounded-xl bg-white">
          <div className="text-3xl font-bold">{data.average}</div>
          <div className="text-yellow-500">★★★★★</div>
          <div className="text-sm text-gray-500">Based on {data.total} reviews</div>
          <div className="mt-3 space-y-1">
            {data.bars.map((b) => (
              <div key={b.stars} className="flex items-center gap-2">
                <span className="w-8 text-xs text-gray-600">{b.stars}★</span>
                <div className="h-2 flex-1 bg-gray-100 rounded">
                  <div className="h-2 bg-green-600 rounded" style={{ width: `${(b.count / max) * 100}%` }} />
                </div>
                <span className="w-6 text-xs text-gray-600">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          {data.items.map((r) => (
            <div key={r.id} className="p-4 border rounded-xl bg-white">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="font-medium">{r.name}</div>
                <div>{r.date}</div>
              </div>
              <div className="text-yellow-500 text-sm">★★★★★</div>
              <p className="text-sm text-gray-800 mt-1">{r.text}</p>
              {r.image && (
                <img alt="review" src={r.image} className="mt-2 h-24 w-24 object-cover rounded" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <FeedbackForm
          productId={productId}
          user={user}
          onSubmitFeedback={handleFeedbackSubmit}
          onClose={() => setShowFeedbackForm(false)}
        />
      )}
    </section>
  );
}








