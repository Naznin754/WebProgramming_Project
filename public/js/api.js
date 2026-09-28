const API_BASE = (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') ? 'http://localhost:3000/api' : '/api';

const API = {
  async fetchTables() {
    const res = await fetch(`${API_BASE}/tables`);
    return await res.json();
  },

  async updateTableStatus(tableId, status) {
    const res = await fetch(`${API_BASE}/tables/${tableId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async fetchMenu(category = '', search = '') {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/menu?${params.toString()}`);
    return await res.json();
  },

  async fetchOrders(filter = 'all') {
    const res = await fetch(`${API_BASE}/orders?filter=${filter}`);
    return await res.json();
  },

  async fetchOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return await res.json();
  },

  async createOrder(tableNumber, items, notes = '') {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber, items, notes })
    });
    return await res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async fetchAttendanceCurrent() {
    const res = await fetch(`${API_BASE}/attendance/current`);
    return await res.json();
  },

  async clockIn() {
    const res = await fetch(`${API_BASE}/attendance/clock-in`, { method: 'POST' });
    return await res.json();
  },

  async clockOut() {
    const res = await fetch(`${API_BASE}/attendance/clock-out`, { method: 'POST' });
    return await res.json();
  },

  async fetchProfile() {
    const res = await fetch(`${API_BASE}/profile`);
    return await res.json();
  },

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async fetchStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return await res.json();
  }
};

window.API = API;
