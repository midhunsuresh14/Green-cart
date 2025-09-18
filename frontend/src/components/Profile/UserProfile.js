import React from 'react';
import './UserProfile.css';

const UserProfile = ({ user, orders = [] }) => {
  const safeUser = user || { name: 'Guest User', email: 'guest@example.com' };

  return (
    <div className="user-profile">
      <div className="container">
        <div className="profile-header">
          <div className="avatar">
            <span className="material-icons">person</span>
          </div>
          <div className="info">
            <h1>{safeUser.name}</h1>
            <p>{safeUser.email}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h2>Account Details</h2>
            <div className="details">
              <div className="row"><span>Name</span><span>{safeUser.name}</span></div>
              <div className="row"><span>Email</span><span>{safeUser.email}</span></div>
              {safeUser.phone && <div className="row"><span>Phone</span><span>{safeUser.phone}</span></div>}
            </div>
            <button className="primary-btn">
              <span className="material-icons">edit</span>
              Edit Profile
            </button>
          </div>

          <div className="profile-card">
            <h2>Recent Orders</h2>
            {(!orders || orders.length === 0) ? (
              <div className="empty">
                <span className="material-icons">inventory_2</span>
                <p>No orders yet. Start shopping to place your first order!</p>
              </div>
            ) : (
              <div className="orders">
                {orders.map((order, idx) => (
                  <div key={order.orderId || idx} className="order">
                    <div>
                      <h3>Order {order.orderId || ''}</h3>
                      <p>{order.date ? new Date(order.date).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="order-total">${Number(order.total || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-card">
            <h2>Addresses</h2>
            <div className="empty">
              <span className="material-icons">location_on</span>
              <p>Add a shipping address to speed up checkout.</p>
            </div>
            <button className="secondary-btn">Add Address</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;




















