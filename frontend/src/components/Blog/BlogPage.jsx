import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBlogPosts, likeBlogPost } from '../../lib/api';
import BlogPost from './BlogPost';
import CreatePost from './CreatePost';
import './Blog.css';

const BlogPage = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Gardening Tips', 'Plant Care', 'Herbal Remedies', 'Success Stories', 'General'];

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 6,
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      };
      
      const response = await getBlogPosts(params);
      setPosts(response.posts);
      setTotalPages(response.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, currentLikes, isLiked) => {
    try {
      await likeBlogPost(postId);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: isLiked ? currentLikes - 1 : currentLikes + 1 }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handlePostCreated = () => {
    setShowCreateForm(false);
    setCurrentPage(1);
    fetchPosts();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="blog-page py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800">Error loading blog posts</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button 
              onClick={fetchPosts}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="blog-page py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GreenCart Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your plant growth stories, learn from others, and discover tips for a greener life
          </p>
          
          {user ? (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              {showCreateForm ? 'Cancel' : 'Share Your Story'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Login to Share Your Story
            </button>
          )}
        </motion.div>

        {/* Create Post Form */}
        {showCreateForm && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <CreatePost onPostCreated={handlePostCreated} user={user} />
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-500">
              {user 
                ? "Be the first to share your plant growth story!" 
                : "Login to share your plant growth stories and read others' experiences."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <BlogPost 
                    post={post} 
                    user={user}
                    onLike={handleLike}
                    onPostUpdated={fetchPosts}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BlogPage;