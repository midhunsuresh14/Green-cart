import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await api.listOrders();
      setOrders(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    try {
      await api.updateOrderStatus(id, status);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="panel-header">
        <h2>Orders</h2>
      </div>
      {error && <div className="badge warning">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customerName || o.user?.name}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td><span className="badge">{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn" onClick={() => setStatus(o.id, 'confirmed')}>Mark Confirmed</button>
                  <button className="btn" onClick={() => setStatus(o.id, 'delivered')} style={{ marginLeft: 6 }}>Mark Delivered</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}












