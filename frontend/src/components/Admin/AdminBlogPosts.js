import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { adminListBlogPosts, adminDeleteBlogPost, assetUrl } from '../../lib/api';
import './AdminBlogPosts.css';

const AdminBlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchBlogPosts();
  }, [currentPage, searchQuery, sortBy, sortOrder]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await adminListBlogPosts({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      setPosts(response.posts || []);
      setTotalPages(response.pages || 1);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      await adminDeleteBlogPost(postId);
      fetchBlogPosts(); // Refresh the list
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogPosts();
  };

  if (loading) {
    return (
      <div className="admin-blog-posts">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-blog-posts">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchBlogPosts} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-blog-posts">
      {/* Search and Filters - Combined in a single responsive row */}
      <div className="admin-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        
        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="created_at">Date</option>
            <option value="title">Title</option>
            <option value="likes">Likes</option>
            <option value="comments_count">Comments</option>
          </select>
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Blog Posts Found</h3>
          <p>{searchQuery ? 'Try a different search term' : 'No blog posts have been created yet'}</p>
        </div>
      ) : (
        <>
          <div className="posts-table">
            <table>
              <thead>
                <tr>
                  <th className="post-info-header">Post Information</th>
                  <th className="author-header">Author</th>
                  <th className="category-header">Category</th>
                  <th className="date-header sortable" onClick={() => handleSort('created_at')}>
                    Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="stats-header">Stats</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id} className="post-row">
                    <td className="post-info">
                      <div className="post-title-container">
                        {post.image_url ? (
                          <img 
                            src={assetUrl(post.image_url)} 
                            alt={post.title} 
                            className="post-image"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=100&q=80';
                            }}
                          />
                        ) : (
                          <div className="post-image-placeholder">
                            <span>🌱</span>
                          </div>
                        )}
                        <div className="post-details">
                          <Link to={`/blog/${post._id}`} target="_blank" rel="noopener noreferrer" className="post-title-link">
                            {post.title}
                          </Link>
                          <p className="post-excerpt">
                            {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="author-cell">
                      <div className="author-info">
                        <div className="author-avatar">
                          {post.author_name?.charAt(0) || 'A'}
                        </div>
                        <span className="author-name">{post.author_name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="category-cell">
                      <span className="category-badge">
                        {post.category || '—'}
                      </span>
                    </td>
                    <td className="date-cell">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                      <span className="time-ago">{format(new Date(post.created_at), 'h:mm a')}</span>
                    </td>
                    <td className="stats-cell">
                      <div className="stats-container">
                        <div className="stat-item likes-stat">
                          <span className="stat-icon">❤️</span>
                          <span className="stat-value">{post.likes || 0}</span>
                        </div>
                        <div className="stat-item comments-stat">
                          <span className="stat-icon">💬</span>
                          <span className="stat-value">{post.comments_count || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-container">
                        <Link to={`/blog/edit/${post._id}`} className="action-btn edit-btn" title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="action-btn delete-btn"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first, last, current, and nearby pages
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  );
                }
                // Show ellipsis for skipped pages
                if (page === 2 && currentPage > 4) {
                  return <span key="start-ellipsis" className="pagination-ellipsis">...</span>;
                }
                if (page === totalPages - 1 && currentPage < totalPages - 3) {
                  return <span key="end-ellipsis" className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBlogPosts;