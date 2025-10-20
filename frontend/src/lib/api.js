const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

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
  
  const url = `${BASE_URL}${path}`;
  console.log('[API] Making request:', {
    method: options.method || 'GET',
    url,
    headers,
    body: options.body
  });
  
  try {
    const res = await fetch(url, { 
      ...options, 
      headers,
      credentials: 'include' // Important for cookies if using sessions
    });
    
    console.log(`[API] Response status: ${res.status} for ${path}`);
    
    if (!res.ok) {
      const text = await res.text();
      console.error(`[API] Request failed: ${res.status}`, text);
      throw new Error(text || `Request failed: ${res.status}`);
    }
    
    if (res.status === 204) return null;
    
    const data = await res.json();
    console.log('[API] Response data:', data);
    return data;
  } catch (error) {
    console.error('[API] Request error:', error);
    throw error;
  }
}

export const api = {
  // Admin stats
  adminStats: () => request('/admin/stats'),

  // Products (Admin + Public)
  listProductsPublic: (path = '') => request(`/products${path}`),
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
  listOrders: (paymentStatus) => request(`/orders${paymentStatus ? `?paymentStatus=${encodeURIComponent(paymentStatus)}` : ''}`),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  createOrder: (payload) => request('/orders/create', { method: 'POST', body: JSON.stringify(payload) }),
  verifyPayment: (payload) => request('/orders/verify', { method: 'POST', body: JSON.stringify(payload) }),

  // Inventory alerts
  lowStock: (threshold) => request(`/admin/low-stock${threshold ? `?threshold=${encodeURIComponent(threshold)}` : ''}`),

  // Users
  listUsers: () => request('/users'),
  updateUserRole: (id, role) => request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  toggleUserActive: (id, active) => request(`/users/${id}/active`, { method: 'PUT', body: JSON.stringify({ active }) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Categories
  listCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  
  // Subcategories
  createSubCategory: (data) => request('/subcategories', { method: 'POST', body: JSON.stringify(data) }),
  updateSubCategory: (id, data) => request(`/subcategories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubCategory: (id) => request(`/subcategories/${id}`, { method: 'DELETE' }),

  // Remedies
  listRemedies: () => request('/remedies'),
  createRemedy: (data) => request('/remedies', { method: 'POST', body: JSON.stringify(data) }),
  updateRemedy: (id, data) => request(`/remedies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRemedy: (id) => request(`/remedies/${id}`, { method: 'DELETE' }),
  bulkUploadRemedies: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/remedies/bulk-upload`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Remedy Categories
  listRemedyCategories: () => request('/remedy-categories'),
  createRemedyCategory: (data) => request('/remedy-categories', { method: 'POST', body: JSON.stringify(data) }),
  updateRemedyCategory: (id, data) => request(`/remedy-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRemedyCategory: (id) => request(`/remedy-categories/${id}`, { method: 'DELETE' }),

  // Admin Notifications
  adminNotifications: () => request('/admin/notifications'),
  markNotificationRead: (id) => request(`/admin/notifications/${id}/mark-read`, { method: 'PUT' }),

  // Chatbot
  chatbot: (messages) => request('/chatbot', { method: 'POST', body: JSON.stringify({ messages }) }),
};