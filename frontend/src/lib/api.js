const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('firebaseIdToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Admin stats
  adminStats: () => request('/admin/stats'),

  // Products (Admin + Public)
  listProductsPublic: () => request('/products'),
  listProducts: (q = '') => request(`/admin/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  uploadImage: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Orders
  listOrders: () => request('/orders'),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Users
  listUsers: () => request('/users'),
  updateUserRole: (id, role) => request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  toggleUserActive: (id, active) => request(`/users/${id}/active`, { method: 'PUT', body: JSON.stringify({ active }) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Remedies
  listRemedies: () => request('/remedies'),
  createRemedy: (data) => request('/remedies', { method: 'POST', body: JSON.stringify(data) }),
  updateRemedy: (id, data) => request(`/remedies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRemedy: (id) => request(`/remedies/${id}`, { method: 'DELETE' }),
};












