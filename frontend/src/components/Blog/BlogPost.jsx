import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { assetUrl, deleteBlogPost } from '../../lib/api';
import CommentSection from './CommentSection';
import './Blog.css';

const BlogPost = ({ post, user, onLike, onPostUpdated }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLike = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike(post._id, post.likes, isLiked);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
  };

  const handleEdit = () => {
    navigate(`/blog/edit/${post._id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteBlogPost(post._id);
      onPostUpdated(); // Refresh the posts list
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const canEditOrDelete = user && (user.id === post.author_id || user.role === 'admin');

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
      whileHover={{ y: -5 }}
    >
      {/* Post Image */}
      <div className="relative h-48 overflow-hidden">
        {post.image_url ? (
          <img 
            src={assetUrl(post.image_url)} 
            alt={post.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">🌱</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white bg-opacity-90 text-green-800 text-xs font-semibold rounded-full">
            {post.category}
          </span>
        </div>
        
        {/* Edit/Delete Options for Author/Admin */}
        {canEditOrDelete && (
          <div className="absolute top-4 left-4 flex space-x-2">
            <button
              onClick={handleEdit}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>
        </div>

        {/* Author and Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-green-800 font-semibold">
                {post.author_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.author_name}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(post.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Post Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <svg 
                className="w-5 h-5" 
                fill={isLiked ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              <span className="text-sm">{post.likes}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 hover:text-green-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              <span className="text-sm">{post.comments_count}</span>
            </button>
          </div>
          
          <Link 
            to={`/blog/${post._id}`}
            className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center"
          >
            Read more
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <CommentSection 
            postId={post._id} 
            user={user} 
            onCommentsUpdate={onPostUpdated}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the post "{post.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BlogPost;