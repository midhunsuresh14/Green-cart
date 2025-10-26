import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ExplorePage from './ExplorePage';
import MyBlogs from './MyBlogs';
import CreatePost from './CreatePost';
import './Blog.css';

const BlogPage = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on URL
  const getActiveTab = () => {
    if (location.pathname === '/blog/my') return 'my-blogs';
    if (location.pathname === '/blog/create') return 'create';
    return 'explore'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh of My Blogs

  // Update active tab when location changes
  React.useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'explore') {
      navigate('/blog');
    } else if (tab === 'my-blogs') {
      navigate('/blog/my');
    } else {
      navigate(`/blog/${tab}`);
    }
  };

  const handlePostCreated = () => {
    // Refresh My Blogs tab
    setRefreshKey(prev => prev + 1);
    handleTabChange('explore');
  };

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
          
          {/* Tab Navigation */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => handleTabChange('explore')}
                className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                  activeTab === 'explore'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } border border-gray-200`}
              >
                Explore
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => handleTabChange('my-blogs')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'my-blogs'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border-t border-b border-gray-200`}
                >
                  My Blogs
                </button>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => handleTabChange('create')}
                  className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                    activeTab === 'create'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-200`}
                >
                  Create Post
                </button>
              )}
              {!user && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 text-sm font-medium rounded-r-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                >
                  Login to Create
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'explore' && (
          <ExplorePage user={user} />
        )}

        {activeTab === 'my-blogs' && user && (
          <MyBlogs key={refreshKey} user={user} />
        )}

        {activeTab === 'create' && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <CreatePost onPostCreated={handlePostCreated} user={user} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BlogPage;