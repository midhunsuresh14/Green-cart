import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserOrders } from '../../lib/api';
import './OrderDetails.css';

const OrderDetails = ({ user }) => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) return;
      
      try {
        setLoading(true);
        const orders = await getUserOrders();
        const foundOrder = orders.find(o => o.id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="loading">
            <span className="material-icons">hourglass_empty</span>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="error">
            <span className="material-icons">error</span>
            <p>{error}</p>
            <button className="primary-btn" onClick={() => window.history.back()}>
              <span className="material-icons">arrow_back</span>
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="error">
            <span className="material-icons">error</span>
            <p>Order not found</p>
            <button className="primary-btn" onClick={() => window.history.back()}>
              <span className="material-icons">arrow_back</span>
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="container">
        <div className="order-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            <span className="material-icons">arrow_back</span>
            Back
          </button>
          <h1>Order Details</h1>
        </div>

        <div className="order-summary">
          <div className="summary-card">
            <h2>Order Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span>Order ID</span>
                <span>#{order.id.substring(0, 8)}</span>
              </div>
              <div className="info-item">
                <span>Date</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-item">
                <span>Status</span>
                <span>
                  <span className={`status-badge ${order.deliveryStatus?.toLowerCase()}`}>
                    {order.deliveryStatus || 'Pending'}
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span>Payment Status</span>
                <span>
                  <span className={`status-badge ${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="info-item">
                  <span>Payment ID</span>
                  <span>{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-card">
            <h2>Order Items</h2>
            {order.items && order.items.length > 0 ? (
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="item-card">
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
                      <h3>{item.name}</h3>
                      <p className="item-category">{item.category}</p>
                      <div className="item-price-quantity">
                        <span className="price">₹{Number(item.price || 0).toFixed(2)}</span>
                        <span className="quantity">Qty: {item.quantity}</span>
                      </div>
                      <div className="item-total">
                        Total: ₹{Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                <span className="material-icons">shopping_cart</span>
                <p>No items found in this order</p>
              </div>
            )}
          </div>

          <div className="summary-card">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{Number(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>₹0.00</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{Number(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;