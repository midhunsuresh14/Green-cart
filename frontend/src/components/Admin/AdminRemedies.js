import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const remedyCategories = [
  { id: 'digestive', name: 'Digestive Health' },
  { id: 'respiratory', name: 'Respiratory' },
  { id: 'immune', name: 'Immune System' },
  { id: 'skin', name: 'Skin Care' },
  { id: 'stress', name: 'Stress & Sleep' },
  { id: 'pain', name: 'Pain Relief' }
];

const empty = { 
  id: null, 
  name: '', 
  category: '', 
  illness: '', 
  keywords: [], 
  image: '', 
  description: '', 
  benefits: [], 
  preparation: '', 
  dosage: '', 
  duration: '', 
  precautions: '', 
  tags: [], 
  effectiveness: '' 
};

export default function AdminRemedies() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  function onEdit(r) { 
    setForm(r); 
    setShowForm(true);
  }
  
  function resetForm() { 
    setForm(empty); 
    setShowForm(false);
  }

  function addKeyword() {
    const keyword = prompt('Enter keyword:');
    if (keyword) {
      setForm({ ...form, keywords: [...form.keywords, keyword] });
    }
  }

  function removeKeyword(index) {
    setForm({ ...form, keywords: form.keywords.filter((_, i) => i !== index) });
  }

  function addBenefit() {
    const benefit = prompt('Enter benefit:');
    if (benefit) {
      setForm({ ...form, benefits: [...form.benefits, benefit] });
    }
  }

  function removeBenefit(index) {
    setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== index) });
  }

  function addTag() {
    const tag = prompt('Enter tag:');
    if (tag) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
  }

  function removeTag(index) {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== index) });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        category: form.category,
        illness: form.illness,
        keywords: form.keywords,
        image: form.image,
        description: form.description,
        benefits: form.benefits,
        preparation: form.preparation,
        dosage: form.dosage,
        duration: form.duration,
        precautions: form.precautions,
        tags: form.tags,
        effectiveness: form.effectiveness
      };
      
      if (form.id) await api.updateRemedy(form.id, payload);
      else await api.createRemedy(payload);
      
      resetForm();
      await load();
    } catch (e) { 
      setError(e.message); 
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this remedy?')) return;
    try { 
      await api.deleteRemedy(id); 
      await load(); 
    } catch (e) { 
      setError(e.message); 
    }
  }

  return (
    <div>
      <div className="panel-header">
        <h2>Herbal Remedies Management</h2>
        <button className="btn primary" onClick={() => setShowForm(true)}>
          Add New Remedy
        </button>
      </div>
      
      {error && <div className="badge warning">{error}</div>}

      {showForm && (
        <div className="remedy-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{form.id ? 'Edit Remedy' : 'Add New Remedy'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={onSubmit} className="remedy-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Remedy Name *</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm({ ...form, category: e.target.value })} 
                    required
                  >
                    <option value="">Select Category</option>
                    {remedyCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Illness/Symptom *</label>
                  <input 
                    value={form.illness} 
                    onChange={e => setForm({ ...form, illness: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input 
                    value={form.image} 
                    onChange={e => setForm({ ...form, image: e.target.value })} 
                    placeholder="/uploads/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Keywords</label>
                <div className="array-input">
                  <div className="array-items">
                    {form.keywords.map((keyword, index) => (
                      <span key={index} className="array-item">
                        {keyword}
                        <button type="button" onClick={() => removeKeyword(index)}>×</button>
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={addKeyword} className="add-btn">+ Add Keyword</button>
                </div>
              </div>

              <div className="form-group">
                <label>Health Benefits</label>
                <div className="array-input">
                  <div className="array-items">
                    {form.benefits.map((benefit, index) => (
                      <span key={index} className="array-item">
                        {benefit}
                        <button type="button" onClick={() => removeBenefit(index)}>×</button>
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={addBenefit} className="add-btn">+ Add Benefit</button>
                </div>
              </div>

              <div className="form-group">
                <label>Preparation Instructions *</label>
                <textarea 
                  value={form.preparation} 
                  onChange={e => setForm({ ...form, preparation: e.target.value })} 
                  required
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dosage</label>
                  <input 
                    value={form.dosage} 
                    onChange={e => setForm({ ...form, dosage: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    value={form.duration} 
                    onChange={e => setForm({ ...form, duration: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Effectiveness</label>
                <input 
                  value={form.effectiveness} 
                  onChange={e => setForm({ ...form, effectiveness: e.target.value })} 
                  placeholder="e.g., High - Works within 30 minutes"
                />
              </div>

              <div className="form-group">
                <label>Precautions</label>
                <textarea 
                  value={form.precautions} 
                  onChange={e => setForm({ ...form, precautions: e.target.value })} 
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="array-input">
                  <div className="array-items">
                    {form.tags.map((tag, index) => (
                      <span key={index} className="array-item">
                        {tag}
                        <button type="button" onClick={() => removeTag(index)}>×</button>
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={addTag} className="add-btn">+ Add Tag</button>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn primary" type="submit">
                  {form.id ? 'Update Remedy' : 'Create Remedy'}
                </button>
                <button className="btn" type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading remedies...</p>
      ) : (
        <div className="remedies-table">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Illness</th>
                <th>Keywords</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="remedy-info">
                      <strong>{r.name}</strong>
                      <small>{r.description?.substring(0, 50)}...</small>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{r.category}</span>
                  </td>
                  <td>{r.illness}</td>
                  <td>
                    <div className="keywords-preview">
                      {r.keywords?.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="keyword-tag">{keyword}</span>
                      ))}
                      {r.keywords?.length > 3 && <span>+{r.keywords.length - 3} more</span>}
                    </div>
                  </td>
                  <td>
                    <button className="btn" onClick={() => onEdit(r)}>Edit</button>
                    <button className="btn danger" onClick={() => onDelete(r.id)}>Delete</button>
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