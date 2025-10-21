import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { addBlogComment, updateBlogComment, deleteBlogComment } from '../../lib/api';
import './Blog.css';

const CommentSection = ({ postId, user, onCommentsUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddComment = async () => {
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await addBlogComment(postId, { content: newComment.trim() });
      setComments([...comments, response.comment]);
      setNewComment('');
      onCommentsUpdate();
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateBlogComment(editingCommentId, { content: editingContent.trim() });
      setComments(comments.map(comment => 
        comment._id === editingCommentId ? response.comment : comment
      ));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (err) {
      setError(err.message || 'Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteBlogComment(commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
      onCommentsUpdate();
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      {/* Add Comment Form */}
      {user ? (
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-800 text-sm font-semibold">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Add a comment..."
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600">Login to join the conversation</p>
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <motion.div 
              key={comment._id}
              className="flex space-x-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-800 text-sm font-semibold">
                    {comment.author_name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900">{comment.author_name}</h4>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  
                  {editingCommentId === comment._id ? (
                    <div className="mt-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                  )}
                </div>
                
                {user && user.id === comment.author_id && editingCommentId !== comment._id && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;