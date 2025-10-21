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

// Export all API functions directly instead of attaching to an object
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
    const res = await fetch(`${BASE_URL}/upload`, {
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
  
  // Feedback
  submitFeedback: (data) => request('/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getFeedback: () => request('/admin/feedback'),
  updateFeedbackStatus: (id, status) => request(`/admin/feedback/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  
  // Blog
  getBlogPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/blog/posts${query ? `?${query}` : ''}`);
  },
  createBlogPost: (data) => request('/blog/posts', { method: 'POST', body: JSON.stringify(data) }),
  getBlogPost: (postId) => request(`/blog/posts/${postId}`),
  updateBlogPost: (postId, data) => request(`/blog/posts/${postId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlogPost: (postId) => request(`/blog/posts/${postId}`, { method: 'DELETE' }),
  likeBlogPost: (postId) => request(`/blog/posts/${postId}/like`, { method: 'POST' }),
  addBlogComment: (postId, data) => request(`/blog/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  updateBlogComment: (commentId, data) => request(`/blog/comments/${commentId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlogComment: (commentId) => request(`/blog/comments/${commentId}`, { method: 'DELETE' }),
  
  // Auth helpers
  getAuthHeaders: getAuthHeaders
};

// Export individual functions for direct access
export const adminStats = api.adminStats;
export const listProductsPublic = api.listProductsPublic;
export const listProducts = api.listProducts;
export const createProduct = api.createProduct;
export const updateProduct = api.updateProduct;
export const deleteProduct = api.deleteProduct;
export const uploadImage = api.uploadImage;
export const listOrders = api.listOrders;
export const updateOrderStatus = api.updateOrderStatus;
export const createOrder = api.createOrder;
export const verifyPayment = api.verifyPayment;
export const lowStock = api.lowStock;
export const listUsers = api.listUsers;
export const updateUserRole = api.updateUserRole;
export const toggleUserActive = api.toggleUserActive;
export const deleteUser = api.deleteUser;
export const listCategories = api.listCategories;
export const createCategory = api.createCategory;
export const updateCategory = api.updateCategory;
export const deleteCategory = api.deleteCategory;
export const createSubCategory = api.createSubCategory;
export const updateSubCategory = api.updateSubCategory;
export const deleteSubCategory = api.deleteSubCategory;
export const listRemedies = api.listRemedies;
export const createRemedy = api.createRemedy;
export const updateRemedy = api.updateRemedy;
export const deleteRemedy = api.deleteRemedy;
export const bulkUploadRemedies = api.bulkUploadRemedies;
export const listRemedyCategories = api.listRemedyCategories;
export const createRemedyCategory = api.createRemedyCategory;
export const updateRemedyCategory = api.updateRemedyCategory;
export const deleteRemedyCategory = api.deleteRemedyCategory;
export const adminNotifications = api.adminNotifications;
export const markNotificationRead = api.markNotificationRead;
export const chatbot = api.chatbot;
export const submitFeedback = api.submitFeedback;
export const getFeedback = api.getFeedback;
export const updateFeedbackStatus = api.updateFeedbackStatus;
export const getBlogPosts = api.getBlogPosts;
export const createBlogPost = api.createBlogPost;
export const getBlogPost = api.getBlogPost;
export const updateBlogPost = api.updateBlogPost;
export const deleteBlogPost = api.deleteBlogPost;
export const likeBlogPost = api.likeBlogPost;
export const addBlogComment = api.addBlogComment;
export const updateBlogComment = api.updateBlogComment;
export const deleteBlogComment = api.deleteBlogComment;
// Rename the export to avoid naming conflict
export const getAuthHeadersFunction = getAuthHeaders;