import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const empty = { id: null, illness: '', plant: '', description: '' };

export default function AdminRemedies() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await api.listRemedies();
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onEdit(r) { setForm(r); }
  function resetForm() { setForm(empty); }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = { illness: form.illness, plant: form.plant, description: form.description };
      if (form.id) await api.updateRemedy(form.id, payload);
      else await api.createRemedy(payload);
      resetForm();
      await load();
    } catch (e) { setError(e.message); }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this remedy?')) return;
    try { await api.deleteRemedy(id); await load(); }
    catch (e) { setError(e.message); }
  }

  return (
    <div>
      <div className="panel-header"><h2>Remedies</h2></div>
      {error && <div className="badge warning">{error}</div>}

      <form onSubmit={onSubmit} className="admin-form" style={{ display:'grid', gap:'0.5rem', gridTemplateColumns:'repeat(4, 1fr)', alignItems:'end', marginBottom:'0.75rem' }}>
        <div>
          <label>Illness</label>
          <input value={form.illness} onChange={e => setForm({ ...form, illness: e.target.value })} required />
        </div>
        <div>
          <label>Plant</label>
          <input value={form.plant} onChange={e => setForm({ ...form, plant: e.target.value })} required />
        </div>
        <div style={{ gridColumn:'span 2' }}>
          <label>Description</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <button className="btn primary" type="submit">{form.id ? 'Update' : 'Create'}</button>
          {form.id && <button className="btn" type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>}
        </div>
      </form>

      {loading ? <p>Loading...</p> : (
        <table className="table">
          <thead><tr><th>Illness</th><th>Plant</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id}>
                <td>{r.illness}</td>
                <td>{r.plant}</td>
                <td>{r.description}</td>
                <td>
                  <button className="btn" onClick={() => onEdit(r)}>Edit</button>
                  <button className="btn danger" onClick={() => onDelete(r.id)} style={{ marginLeft: 6 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}