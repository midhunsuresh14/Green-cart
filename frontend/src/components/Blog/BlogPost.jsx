import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import { assetUrl } from '../../lib/api';
import CommentSection from './CommentSection';
import './Blog.css';

const BlogPost = ({ post, user, onLike, onPostUpdated }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  // Check if the post is already liked by the current user
  useEffect(() => {
    if (user && post.liked !== undefined) {
      setIsLiked(post.liked);
    } else if (user) {
      // For existing implementation compability
      setIsLiked(false);
    }
  }, [user, post.liked]);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike(post._id, post.likes, isLiked);
  };

  const handleCommentsClick = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  return (
    <motion.div
      className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-300 h-full flex flex-col overflow-hidden border border-slate-100 group"
      whileHover={{ y: -8 }}
    >
      {/* Post Image */}
      <div className="relative h-56 overflow-hidden">
        <Link to={`/blog/${post._id}`} className="block w-full h-full">
          {post.image_url ? (
            <img
              src={assetUrl(post.image_url)}
              alt={post.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
              <span className="text-4xl">🌱</span>
            </div>
          )}

          <div className="absolute top-4 right-4">
            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-[#2F6C4E] text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
              {post.category}
            </span>
          </div>
        </Link>
      </div>

      {/* Post Content */}
      <div className="p-7 flex-grow flex flex-col">
        <div className="flex-grow">
          {/* Author info mini */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#2F6C4E] font-bold text-xs ring-2 ring-white shadow-sm">
              {post.author_name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 leading-none">{post.author_name}</span>
              <span className="text-[10px] font-medium text-slate-400">{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <Link to={`/blog/${post._id}`} className="block group-hover:text-[#2F6C4E] transition-colors">
            <h3 className="text-xl font-black text-slate-800 mb-3 line-clamp-2 leading-tight">
              {post.title}
            </h3>
          </Link>

          <p className="text-slate-500 mb-6 line-clamp-3 text-sm leading-relaxed">
            {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
          <div className="flex gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </button>

            <button
              onClick={handleCommentsClick}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-[#2F6C4E] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments_count}</span>
            </button>
          </div>

          <Link
            to={`/blog/${post._id}`}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#2F6C4E] hover:text-white transition-all shadow-sm"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
          >
            <div className="px-6 py-4">
              <CommentSection
                postId={post._id}
                user={user}
                onCommentsUpdate={onPostUpdated}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlogPost;