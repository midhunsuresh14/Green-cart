import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getBlogPost, likeBlogPost, deleteBlogPost } from '../../lib/api';
import CommentSection from './CommentSection';
import './Blog.css';

const BlogPostDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getBlogPost(id);
      setPost(response.post);
      setComments(response.comments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await likeBlogPost(id);
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setPost({
        ...post,
        likes: newLikedState ? post.likes + 1 : post.likes - 1
      });
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await deleteBlogPost(id);
      navigate('/blog');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentsUpdate = () => {
    // Refresh the post to get updated comment count
    fetchPost();
  };

  if (loading) {
    return (
      <div className="blog-post-detail py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-detail py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800">Error loading post</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <Link 
              to="/blog" 
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post-detail py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Post not found</h3>
            <Link 
              to="/blog" 
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="blog-post-detail py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="flex items-center text-green-600 hover:text-green-800 mb-6"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>

        {/* Post Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              {post.category}
            </span>
            
            {user && (user.id === post.author_id || user.role === 'admin') && (
              <div className="flex space-x-2">
                <Link 
                  to={`/blog/edit/${post._id}`}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md hover:bg-blue-200"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          {/* Author and Date */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <span className="text-green-800 font-semibold text-lg">
                {post.author_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {post.author_name}
              </p>
              <p className="text-gray-500">
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </header>

        {/* Post Image */}
        {post.image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-12">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <svg 
                className="w-6 h-6" 
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
              <span>{post.likes} likes</span>
            </button>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              <span>{post.comments_count} comments</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection 
          postId={post._id} 
          user={user} 
          onCommentsUpdate={handleCommentsUpdate}
        />
      </div>
    </motion.div>
  );
};

export default BlogPostDetail;