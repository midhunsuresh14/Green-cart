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
  
  try {
    const res = await fetch(url, { 
      ...options, 
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    
    if (res.status === 204) return null;
    
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export const eventsApi = {
  // Public endpoints
  getEvents: () => request('/events'),
  
  // Admin endpoints
  adminGetEvents: () => request('/admin/events'),
  createEvent: (data) => {
    console.log('Creating event with data:', data);
    return request('/admin/events', { method: 'POST', body: JSON.stringify(data) });
  },
  updateEvent: (id, data) => request(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/admin/events/${id}`, { method: 'DELETE' }),
  
  // User endpoints
  bookEvent: (eventId, data) => request(`/events/${eventId}/book`, { method: 'POST', body: JSON.stringify(data) }),
  processEventPayment: (bookingId, data) => request(`/events/bookings/${bookingId}/payment`, { method: 'POST', body: JSON.stringify(data) }),
  getTicket: (ticketId) => request(`/events/tickets/${ticketId}`),
};