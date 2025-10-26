import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../../lib/api';
import './UserProfile.css';

const UserProfile = ({ user, wishlistItems = [] }) => {
  const safeUser = user || { name: 'Guest User', email: 'guest@example.com' };
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // orders, wishlist, settings

  // Fetch user-specific orders
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      
      try {
        setLoadingOrders(true);
        const orders = await getUserOrders();
        setUserOrders(orders);
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  // Function to handle image loading success
  const handleImageLoad = (e) => {
    e.target.style.display = 'block';
    e.target.nextSibling.style.display = 'none';
  };

  // Function to handle edit profile
  const handleEditProfile = () => {
    // For now, redirect to a placeholder edit page
    // In a real implementation, this would open a modal or navigate to an edit form
    alert('Edit profile functionality would be implemented here. For now, you can edit your profile information in the account settings.');
  };

  // Function to view product details
  const handleViewProduct = (productId) => {
    window.location.href = `/pdp/${productId}`;
  };

  // Calculate user stats
  const userStats = {
    totalOrders: userOrders.length,
    wishlistCount: wishlistItems.length,
    totalSpent: userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  };

  return (
    <div className="user-profile-dashboard">
      <div className="dashboard-container">
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <span className="material-icons">person</span>
            </div>
            <div className="profile-info">
              <h1>{safeUser.name}</h1>
              <p>{safeUser.email}</p>
              {safeUser.phone && <p>{safeUser.phone}</p>}
              <p className="member-since">Member since {safeUser.createdAt ? formatDate(safeUser.createdAt) : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* User Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <span className="material-icons">shopping_cart</span>
            </div>
            <div className="stat-content">
              <h3>{userStats.totalOrders}</h3>
              <p>Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <span className="material-icons">favorite</span>
            </div>
            <div className="stat-content">
              <h3>{userStats.wishlistCount}</h3>
              <p>Wishlist Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <span className="material-icons">account_balance_wallet</span>
            </div>
            <div className="stat-content">
              <h3>₹{userStats.totalSpent.toFixed(2)}</h3>
              <p>Total Spent</p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="dashboard-layout">
          {/* Left Column - Account Details */}
          <div className="account-sidebar">
            <div className="account-card">
              <h2>Account Details</h2>
              <div className="account-details">
                <div className="detail-row">
                  <span className="label">Name</span>
                  <span className="value">{safeUser.name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email</span>
                  <span className="value">{safeUser.email}</span>
                </div>
                {safeUser.phone && (
                  <div className="detail-row">
                    <span className="label">Phone</span>
                    <span className="value">{safeUser.phone}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Member Since</span>
                  <span className="value">{safeUser.createdAt ? formatDate(safeUser.createdAt) : 'N/A'}</span>
                </div>
              </div>
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                <span className="material-icons">edit</span>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="content-area">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span className="material-icons">shopping_cart</span>
                Orders
              </button>
              <button 
                className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <span className="material-icons">favorite</span>
                Wishlist
              </button>
              <button 
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="material-icons">settings</span>
                Settings
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="orders-tab">
                  {loadingOrders ? (
                    <div className="loading-state">
                      <span className="material-icons">hourglass_empty</span>
                      <p>Loading orders...</p>
                    </div>
                  ) : error ? (
                    <div className="error-state">
                      <span className="material-icons">error</span>
                      <p>{error}</p>
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="empty-state">
                      <span className="material-icons">inventory_2</span>
                      <h3>No Orders Yet</h3>
                      <p>Start shopping to place your first order!</p>
                      <button className="primary-btn" onClick={() => window.location.href = '/products'}>
                        <span className="material-icons">shopping_cart</span>
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {userOrders.map((order) => (
                        <div key={order.id} className="order-card">
                          {/* Order Header with ID, Date, and Status */}
                          <div className="order-header">
                            <div className="order-basic-info">
                              <div className="order-id">Order #{order.id.substring(0, 8)}</div>
                              <div className="order-date">{formatDate(order.createdAt)}</div>
                            </div>
                            <div className="order-status-badge">
                              <span className={`status-badge ${order.deliveryStatus?.toLowerCase()}`}>
                                {order.deliveryStatus || 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Product previews with improved alignment */}
                          <div className="order-products">
                            {order.items && order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="product-preview">
                                <div className="product-image-container">
                                  {item.image ? (
                                    <>
                                      <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="product-image"
                                        onError={handleImageError}
                                        onLoad={handleImageLoad}
                                      />
                                      <div className="placeholder-image">
                                        <span className="material-icons">image</span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="placeholder-image">
                                      <span className="material-icons">image</span>
                                    </div>
                                  )}
                                </div>
                                <div className="product-details">
                                  <h4 className="product-name">{item.name}</h4>
                                  <p className="product-quantity">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items && order.items.length > 2 && (
                              <div className="more-products-indicator">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                          
                          {/* Order Footer with Total and Action Button */}
                          <div className="order-footer">
                            <div className="order-total">
                              <span className="total-label">Total:</span>
                              <span className="amount">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                            </div>
                            <button 
                              className="view-details-btn" 
                              onClick={() => window.location.href = `/orders/${order.id}`}
                            >
                              <span className="material-icons">visibility</span>
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="wishlist-tab">
                  {wishlistItems.length === 0 ? (
                    <div className="empty-state">
                      <span className="material-icons">favorite</span>
                      <h3>Your wishlist is empty</h3>
                      <p>Start adding items you love!</p>
                      <button className="secondary-btn" onClick={() => window.location.href = '/products'}>
                        <span className="material-icons">shopping_cart</span>
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="wishlist-content">
                      <h3>Your Wishlist ({wishlistItems.length} items)</h3>
                      <div className="wishlist-grid">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="wishlist-item">
                            <div className="wishlist-item-image-container">
                              {item.image ? (
                                <>
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="wishlist-item-image"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                  />
                                  <div className="wishlist-placeholder-image">
                                    <span className="material-icons">image</span>
                                  </div>
                                </>
                              ) : (
                                <div className="wishlist-placeholder-image">
                                  <span className="material-icons">image</span>
                                </div>
                              )}
                            </div>
                            <div className="wishlist-item-details">
                              <h4 className="wishlist-item-name">{item.name}</h4>
                              <p className="wishlist-item-price">₹{Number(item.price || 0).toFixed(2)}</p>
                              <button 
                                className="view-product-btn" 
                                onClick={() => handleViewProduct(item.id)}
                              >
                                View Product
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="secondary-btn" onClick={() => window.location.href = '/wishlist'}>
                        <span className="material-icons">visibility</span>
                        View Full Wishlist
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="settings-tab">
                  <div className="settings-content">
                    <h3>Account Settings</h3>
                    <div className="settings-grid">
                      <div className="setting-card">
                        <div className="setting-icon">
                          <span className="material-icons">person</span>
                        </div>
                        <div className="setting-details">
                          <h4>Personal Information</h4>
                          <p>Update your name, email, and phone number</p>
                        </div>
                        <button className="setting-action-btn" onClick={handleEditProfile}>
                          Edit
                        </button>
                      </div>
                      <div className="setting-card">
                        <div className="setting-icon">
                          <span className="material-icons">lock</span>
                        </div>
                        <div className="setting-details">
                          <h4>Password & Security</h4>
                          <p>Change your password and update security settings</p>
                        </div>
                        <button className="setting-action-btn">
                          Manage
                        </button>
                      </div>
                      <div className="setting-card">
                        <div className="setting-icon">
                          <span className="material-icons">notifications</span>
                        </div>
                        <div className="setting-details">
                          <h4>Notifications</h4>
                          <p>Manage your email and push notifications</p>
                        </div>
                        <button className="setting-action-btn">
                          Configure
                        </button>
                      </div>
                      <div className="setting-card">
                        <div className="setting-icon">
                          <span className="material-icons">payment</span>
                        </div>
                        <div className="setting-details">
                          <h4>Payment Methods</h4>
                          <p>Manage your saved payment methods</p>
                        </div>
                        <button className="setting-action-btn">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;