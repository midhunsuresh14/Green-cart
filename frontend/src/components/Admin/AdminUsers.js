import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await api.listUsers();
      // Show all users including admins
      setUsers(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // NOTE: Role changes are intentionally disabled for admins per policy.

  async function toggleActive(id, active) {
    try {
      await api.toggleUserActive(id, active);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeUser(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="panel-header">
        <h2>Users</h2>
      </div>
      {error && <div className="badge warning">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge">{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.active ? 'success' : 'warning'}`}>{u.active ? 'active' : 'disabled'}</span>
                </td>
                <td>
                  <button className="btn" onClick={() => toggleActive(u.id, !u.active)}>{u.active ? 'Disable' : 'Enable'}</button>
                  <button className="btn danger" style={{ marginLeft: 6 }} onClick={() => removeUser(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}






