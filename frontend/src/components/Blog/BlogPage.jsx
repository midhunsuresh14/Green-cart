import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, Layout, Leaf } from 'lucide-react';
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
  useEffect(() => {
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

  const tabs = [
    { id: 'explore', label: 'Explore', icon: Layout },
    ...(user ? [
      { id: 'my-blogs', label: 'My Stories', icon: BookOpen },
      { id: 'create', label: 'Write Story', icon: PenTool }
    ] : [])
  ];

  return (
    <div className="blog-page min-h-screen bg-[#FDFCF8]">
      {/* Premium Hero Section */}
      <div className="bg-[#2F6C4E] pt-28 pb-32 px-4 rounded-b-[4rem] shadow-xl relative z-10 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Leaf size={300} />
        </div>

        <motion.div
          className="max-w-7xl mx-auto text-center relative z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-green-50 mb-6 border border-white/20">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">Community Stories</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight leading-tight">
            GreenCart <span className="text-green-300">Chronicles</span>
          </h1>

          <p className="text-xl text-green-50/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Share your plant growth journey, learn from fellow gardeners, and discover tips for a greener life.
          </p>

          {/* Floating Navigation Pills */}
          <div className="mt-12 inline-flex flex-wrap justify-center gap-4 bg-white/10 backdrop-blur-lg p-2 rounded-full border border-white/20 shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                    ? 'bg-white text-[#2F6C4E] shadow-lg scale-105'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}

            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 rounded-full text-sm font-bold text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 border-l border-white/20 ml-2"
              >
                Login to Write
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'explore' && (
              <ExplorePage user={user} />
            )}

            {activeTab === 'my-blogs' && user && (
              <MyBlogs key={refreshKey} user={user} />
            )}

            {activeTab === 'create' && user && (
              <CreatePost onPostCreated={handlePostCreated} user={user} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;