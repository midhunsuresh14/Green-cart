import React, { useState, useEffect } from 'react';
import './DatabaseStatus.css';

function DatabaseStatus() {
  const [dbStatus, setDbStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    fetchDatabaseStatus();
    fetchUsers();
  }, []);

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/db-status');
      const data = await response.json();
      setDbStatus(data);
    } catch (err) {
      setError('Failed to fetch database status');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api') + '/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="db-status-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading database information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-status-container">
      <div className="db-status-header">
        <h2>
          <span className="material-icons">storage</span>
          MongoDB Connection Status
        </h2>
        <div className="status-indicator">
          <span className={`status-dot ${dbStatus?.success ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {dbStatus?.success ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <span className="material-icons">info</span>
          Database Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="material-icons">people</span>
          Users ({users.length})
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <span className="material-icons">error</span>
          {error}
        </div>
      )}

      {activeTab === 'status' && dbStatus && (
        <div className="status-content">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <span className="material-icons">dns</span>
              </div>
              <div className="info-details">
                <h3>Database</h3>
                <p>{dbStatus.database}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <span className="material-icons">link</span>
              </div>
              <div className="info-details">
                <h3>Connection URI</h3>
                <p>{dbStatus.connection_uri}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <span className="material-icons">folder</span>
              </div>
              <div className="info-details">
                <h3>Database Size</h3>
                <p>{dbStatus.database_size}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <span className="material-icons">view_module</span>
              </div>
              <div className="info-details">
                <h3>Collections</h3>
                <p>{dbStatus.collections?.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="connection-details">
            <h3>Connection Details</h3>
            <div className="detail-item">
              <strong>Status:</strong> 
              <span className={`status-badge ${dbStatus.success ? 'success' : 'error'}`}>
                {dbStatus.success ? 'Connected' : 'Failed'}
              </span>
            </div>
            <div className="detail-item">
              <strong>Message:</strong> {dbStatus.message}
            </div>
            <div className="detail-item">
              <strong>Total Users:</strong> {dbStatus.user_count}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <div className="users-header">
            <h3>Registered Users</h3>
            <button className="refresh-btn" onClick={fetchUsers}>
              <span className="material-icons">refresh</span>
              Refresh
            </button>
          </div>

          {users.length === 0 ? (
            <div className="no-users">
              <span className="material-icons">person_off</span>
              <p>No users found in the database</p>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <div className="header-cell">Name</div>
                <div className="header-cell">Email</div>
                <div className="header-cell">Phone</div>
                <div className="header-cell">Role</div>
                <div className="header-cell">Created</div>
              </div>
              
              {users.map((user) => (
                <div key={user._id} className="table-row">
                  <div className="table-cell">
                    <div className="user-avatar">
                      <span className="material-icons">person</span>
                    </div>
                    <span>{user.name}</span>
                  </div>
                  <div className="table-cell">{user.email}</div>
                  <div className="table-cell">{user.phone}</div>
                  <div className="table-cell">
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="table-cell">
                    {formatDate(user.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DatabaseStatus;