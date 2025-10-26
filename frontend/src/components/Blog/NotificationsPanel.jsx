import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getBlogNotifications, markBlogNotificationRead, deleteBlogNotification, deleteAllBlogNotifications } from '../../lib/api';
import './NotificationsPanel.css';

const NotificationsPanel = ({ user, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
      
      // Poll for new notifications every 5 seconds
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getBlogNotifications();
      setNotifications(response.notifications || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await markBlogNotificationRead(notifId);
      setNotifications(notifications.map(notif => 
        notif._id === notifId ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(notif => markBlogNotificationRead(notif._id)));
      
      // Update the state to mark all as read
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      await deleteBlogNotification(notifId);
      setNotifications(notifications.filter(notif => notif._id !== notifId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await deleteAllBlogNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h2>Notifications</h2>
          <div className="notifications-header-actions">
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
            {notifications.length > 0 && (
              <>
                <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                  <span className="material-icons">done_all</span>
                  Mark All Read
                </button>
                <button className="clear-all-btn" onClick={handleClearAllNotifications}>
                  <span className="material-icons">delete</span>
                  Clear All
                </button>
              </>
            )}
            <button className="close-btn" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="notifications-loading">
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="notifications-error">
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification._id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                <Link
                  to={`/blog/${notification.post_id}`}
                  className="notification-link"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.type === 'like' ? '❤️' : '💬'}
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">
                      <strong>{notification.actor_name}</strong> {notification.type === 'like' ? 'liked' : 'commented on'} your post
                    </p>
                    <span className="notification-time">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </Link>
                <div className="notification-actions">
                  {!notification.read && (
                    <button 
                      className="mark-read-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      title="Mark as read"
                    >
                      <span className="material-icons">done</span>
                    </button>
                  )}
                  <button 
                    className="delete-notification-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                    title="Delete notification"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;