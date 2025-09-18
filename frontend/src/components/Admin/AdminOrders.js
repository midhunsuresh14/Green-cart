import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await api.listOrders(paymentFilter || undefined);
      setOrders(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [paymentFilter]);

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
        <div className="filters" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 500, color: '#14532d' }}>Payment Status:</label>
          <select
            className="select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>
      {error && <div className="badge warning">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrapper">
          <table className="table table-elevated">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Payment ID</th>
                <th>Delivery</th>
                <th>Date</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="mono">#{o.id}</td>
                  <td>{o.customerName || o.userId}</td>
                  <td className="mono">₹{Number(o.totalAmount).toFixed(2)}</td>
                  <td>
                    <span
                      className={`chip ${o.paymentStatus === 'Success' ? 'success' : o.paymentStatus === 'Pending' ? 'pending' : 'failed'}`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="truncate" title={o.razorpayPaymentId || '-' }>{o.razorpayPaymentId || '-'}</td>
                  <td>
                    <span className={`chip ${o.deliveryStatus === 'Delivered' ? 'success' : o.deliveryStatus === 'Shipped' ? 'info' : 'pending'}`}>
                      {o.deliveryStatus}
                    </span>
                  </td>
                  <td className="mono">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="actions">
                    <div className="btn-group vertical">
                      <button className="btn outline info" onClick={() => setStatus(o.id, 'Confirmed')}>Mark Confirmed</button>
                      <button className="btn outline primary" onClick={() => setStatus(o.id, 'Shipped')}>Mark Shipped</button>
                      <button className="btn outline success" onClick={() => setStatus(o.id, 'Delivered')}>Mark Delivered</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


















