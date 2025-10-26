import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../../lib/api';
import './UserOrders.css';

const UserOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const orders = await getUserOrders();
        setOrders(orders);
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="user-orders-page">
        <div className="container">
          <div className="loading">
            <span className="material-icons">hourglass_empty</span>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-orders-page">
        <div className="container">
          <div className="error">
            <span className="material-icons">error</span>
            <p>{error}</p>
            <button className="primary-btn" onClick={() => window.history.back()}>
              <span className="material-icons">arrow_back</span>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-orders-page">
      <div className="container">
        <div className="page-header">
          <h1>Your Orders</h1>
          <p>View and manage your order history</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty">
              <span className="material-icons">inventory_2</span>
              <h3>No Orders Yet</h3>
              <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <button className="primary-btn" onClick={() => window.location.href = '/products'}>
                <span className="material-icons">shopping_cart</span>
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-id">Order #{order.id.substring(0, 8)}</div>
                    <div className="order-date">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.deliveryStatus?.toLowerCase()}`}>
                      {order.deliveryStatus || 'Pending'}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items && order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="item-preview">
                      <div className="item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="placeholder-image">
                            <span className="material-icons">image</span>
                          </div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items && order.items.length > 2 && (
                    <div className="more-items">
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <span className="amount">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <button 
                    className="secondary-btn" 
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
    </div>
  );
};

export default UserOrders;