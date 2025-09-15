import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function StatsCards() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, remedies: 0 });
  const [error, setError] = useState('');
  useEffect(() => {
    api.adminStats().then(setStats).catch(e => setError(e.message));
  }, []);
  return (
    <div className="cards-grid">
      {error && <div className="badge warning">{error}</div>}
      <div className="stat-card">
        <h3>Users</h3>
        <p className="stat-value">{stats.users}</p>
      </div>
      <div className="stat-card">
        <h3>Products</h3>
        <p className="stat-value">{stats.products}</p>
      </div>
      <div className="stat-card">
        <h3>Orders</h3>
        <p className="stat-value">{stats.orders}</p>
      </div>
      <div className="stat-card">
        <h3>Remedies</h3>
        <p className="stat-value">{stats.remedies}</p>
      </div>
    </div>
  );
}