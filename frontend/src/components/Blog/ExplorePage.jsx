import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, ThumbsUp, Clock, ChevronRight, X } from 'lucide-react';
import { getBlogPosts, likeBlogPost } from '../../lib/api';
import BlogPost from './BlogPost';
import './Blog.css';

const ExplorePage = ({ user, onLike, onPostUpdated }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Gardening Tips', 'Plant Care', 'Herbal Remedies', 'Success Stories', 'General'];

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy, searchQuery, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sortBy: sortBy !== 'latest' ? sortBy : undefined,
        search: searchQuery || undefined
      };

      const response = await getBlogPosts(params);
      setPosts(response.posts);
      setTotalPages(response.pages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, currentLikes, isLiked) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await likeBlogPost(postId);
      const newLikedState = response.liked;
      const likesDelta = newLikedState ? 1 : -1;

      setPosts(posts.map(post =>
        post._id === postId
          ? {
            ...post,
            likes: post.likes + likesDelta,
            liked: newLikedState
          }
          : post
      ));

      if (onLike) {
        onLike(postId, currentLikes + likesDelta, !newLikedState);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="explore-content space-y-12">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Search Bar */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-green-200/20 blur-xl rounded-[2rem] transform scale-105 transition-all duration-300 group-hover:bg-green-300/30"></div>
              <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="relative bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-2 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shrink-0 ml-1 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-800 text-lg placeholder:text-slate-400 font-medium px-2 h-12"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Categories & Sort */}
          <div className="lg:col-span-12 xl:col-span-7 flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start flex-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 active:scale-95 ${selectedCategory === category
                      ? 'bg-[#2F6C4E] text-white shadow-lg shadow-green-900/20'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-bold py-3 pl-4 pr-10 rounded-2xl cursor-pointer hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              >
                <option value="latest">Latest Stories</option>
                <option value="most_liked">Most Liked</option>
                <option value="trending">Trending Now</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-slate-100 border-t-[#2F6C4E]"></div>
          <p className="mt-4 text-slate-400 font-medium animate-pulse">Curating fresh stories...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-[2rem] p-8 text-center border border-red-100 max-w-2xl mx-auto">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            Retry Loading
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No stories found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            We couldn't find any articles matching your search. Try different keywords or browse all categories.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <BlogPost
                    post={post}
                    user={user}
                    onLike={handleLike}
                    onPostUpdated={onPostUpdated || fetchPosts}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-8">
              <nav className="inline-flex bg-white p-2 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 px-4">
                  <span className="text-slate-800 font-black">{currentPage}</span>
                  <span className="text-slate-400 font-medium">/</span>
                  <span className="text-slate-400 font-medium">{totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExplorePage;