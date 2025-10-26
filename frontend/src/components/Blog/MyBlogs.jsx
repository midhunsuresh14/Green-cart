import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getMyBlogPosts, deleteBlogPost, likeBlogPost, assetUrl } from '../../lib/api';
import BlogPost from './BlogPost';
import './MyBlogs.css';

const MyBlogs = ({ user }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which menu is open

  useEffect(() => {
    if (user) {
      fetchMyBlogs();
    } else {
      navigate('/login');
    }
  }, [currentPage, user]);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const response = await getMyBlogPosts({
        page: currentPage,
        limit: 12
      });
      setPosts(response.posts || []);
      setTotalPages(response.pages || 1);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load your blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      setOpenMenuId(null); // Close the menu
      return;
    }

    try {
      await deleteBlogPost(postId);
      fetchMyBlogs(); // Refresh the list
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    } finally {
      setOpenMenuId(null); // Close the menu
    }
  };

  const handleLike = async (postId, currentLikes, isLiked) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await likeBlogPost(postId);
      const newLikedState = response.liked; // Use the liked status from the response
      const likesDelta = newLikedState ? 1 : -1; // Increment if liked, decrement if unliked
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likes: post.likes + likesDelta, 
              liked: newLikedState 
            }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  if (!user) {
    return null;
  }

  return (
    <div className="my-blogs-page">
      <div className="container mx-auto px-4 py-8">
        <div className="my-blogs-header">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Blogs</h1>
          <p className="text-gray-600 mb-6">
            Manage your blog posts. Edit or delete them anytime.
          </p>
          <Link 
            to="/blog/create"
            className="create-post-btn"
          >
            + Create New Post
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading your blogs...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any blog posts yet.</p>
            <Link to="/blog/create" className="create-post-btn">
              Create Your First Post
            </Link>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="my-blog-card"
                >
                  {/* Three dots menu in upper right corner */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === post._id ? null : post._id);
                      }}
                      className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 shadow-md focus:outline-none"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {openMenuId === post._id && (
                      <div 
                        className="absolute top-10 right-2 z-20 bg-white rounded-md shadow-lg py-1 w-32"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/blog/edit/${post._id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setOpenMenuId(null)}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="blog-image-container">
                    {post.image_url ? (
                      <img 
                        src={assetUrl(post.image_url)} 
                        alt={post.title} 
                        className="blog-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="blog-image-placeholder">
                        <span className="text-6xl">🌱</span>
                      </div>
                    )}
                  </div>

                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="blog-category">{post.category}</span>
                      <span className="blog-date">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <h3 className="blog-title">
                      <Link to={`/blog/${post._id}`}>{post.title}</Link>
                    </h3>
                    
                    <p className="blog-excerpt">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>
                    
                    <div className="blog-stats">
                      <span className="stat-item">
                        ❤️ {post.likes || 0} likes
                      </span>
                      <span className="stat-item">
                        💬 {post.comments_count || 0} comments
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                
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
    </div>
  );
};

export default MyBlogs;
