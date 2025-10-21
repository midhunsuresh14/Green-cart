import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import './AdminFeedback.css';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'ratings.overall', label: 'Overall Rating' },
    { value: 'status', label: 'Status' }
  ];

  useEffect(() => {
    fetchFeedback();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      const response = await api.getFeedback();
      setFeedback(response.feedback || []);
      setTotalPages(response.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      await api.updateFeedbackStatus(feedbackId, newStatus);
      fetchFeedback(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'reviewed': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''}`}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-feedback">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-feedback">
      <div className="feedback-header">
        <h1>User Feedback Management</h1>
        <p>Manage and review user feedback submissions</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>Error: {error}</p>
          <button onClick={fetchFeedback}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="feedback-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-order">Order:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="feedback-list">
        {feedback.length === 0 ? (
          <div className="no-feedback">
            <p>No feedback found matching your criteria.</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item._id} className="feedback-item">
              <div className="feedback-item-header">
                <div className="feedback-meta">
                  <span className="feedback-date">
                    {formatDate(item.createdAt)}
                  </span>
                  {item.userEmail && (
                    <span className="feedback-user">
                      {item.userEmail}
                    </span>
                  )}
                </div>
                <div className="feedback-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="feedback-ratings">
                <h4>Ratings:</h4>
                <div className="ratings-grid">
                  {Object.entries(item.ratings).map(([category, rating]) => (
                    <div key={category} className="rating-item">
                      <span className="rating-category">
                        {category.charAt(0).toUpperCase() + category.slice(1)}:
                      </span>
                      <div className="rating-stars">
                        {getRatingStars(rating)}
                      </div>
                      <span className="rating-value">{rating}/5</span>
                    </div>
                  ))}
                </div>
              </div>

              {item.feedback && (
                <div className="feedback-comments">
                  <h4>Comments:</h4>
                  <p>{item.feedback}</p>
                </div>
              )}

              {item.suggestions && (
                <div className="feedback-suggestions">
                  <h4>Suggestions:</h4>
                  <p>{item.suggestions}</p>
                </div>
              )}

              <div className="feedback-actions">
                <div className="status-actions">
                  <label htmlFor={`status-${item._id}`}>Update Status:</label>
                  <select
                    id={`status-${item._id}`}
                    value={item.status}
                    onChange={(e) => updateFeedbackStatus(item._id, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="feedback-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;

