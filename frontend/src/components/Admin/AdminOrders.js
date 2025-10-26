import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first, 'asc' for oldest first

  async function load() {
    try {
      setLoading(true);
      // Build query parameters object with only non-empty values
      const params = {
        sortOrder: sortOrder
      };
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (deliveryFilter) params.deliveryStatus = deliveryFilter;
      
      const data = await api.listOrders(params);
      setOrders(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
  }, [paymentFilter, deliveryFilter, sortOrder]);

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
          <label style={{ fontWeight: 500, color: '#14532d' }}>Sort:</label>
          <select
            className="select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          
          <label style={{ fontWeight: 500, color: '#14532d', marginLeft: 16 }}>Payment Status:</label>
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
          
          <label style={{ fontWeight: 500, color: '#14532d', marginLeft: 16 }}>Delivery Status:</label>
          <select
            className="select"
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
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
                  <td className="mono">#{o.id.substring(0, 8)}</td>
                  <td>
                    <div>{o.customerName || 'N/A'}</div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>{o.customerEmail || '—'}</div>
                  </td>
                  <td className="mono">₹{Number(o.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <span
                      className={`chip ${o.paymentStatus === 'Success' ? 'success' : o.paymentStatus === 'Pending' ? 'pending' : 'failed'}`}
                    >
                      {o.paymentStatus || '—'}
                    </span>
                  </td>
                  <td className="truncate" title={o.razorpayPaymentId || '-' }>{o.razorpayPaymentId ? `${o.razorpayPaymentId.substring(0, 15)}...` : '-'}</td>
                  <td>
                    <span className={`chip ${o.deliveryStatus === 'Delivered' ? 'success' : o.deliveryStatus === 'Shipped' ? 'info' : o.deliveryStatus === 'Confirmed' ? 'warning' : 'pending'}`}>
                      {o.deliveryStatus || '—'}
                    </span>
                  </td>
                  <td className="mono">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                  <td className="actions">
                    <div className="btn-group vertical">
                      <button 
                        className="btn outline info" 
                        onClick={() => setStatus(o.id, 'Confirmed')}
                        disabled={o.deliveryStatus === 'Confirmed' || o.deliveryStatus === 'Shipped' || o.deliveryStatus === 'Delivered'}
                      >
                        Mark Confirmed
                      </button>
                      <button 
                        className="btn outline primary" 
                        onClick={() => setStatus(o.id, 'Shipped')}
                        disabled={o.deliveryStatus === 'Shipped' || o.deliveryStatus === 'Delivered'}
                      >
                        Mark Shipped
                      </button>
                      <button 
                        className="btn outline success" 
                        onClick={() => setStatus(o.id, 'Delivered')}
                        disabled={o.deliveryStatus === 'Delivered'}
                      >
                        Mark Delivered
                      </button>
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