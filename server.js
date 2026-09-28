const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { dbService } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files from current directory
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Root route redirect to orders page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'orders.html'));
});

// ==================== REST API ENDPOINTS ====================

// --- 1. TABLES API ---
app.get('/api/tables', async (req, res) => {
  try {
    const tables = dbService.getTables();
    const available = tables.filter(t => t.status === 'free' || t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    res.json({ success: true, tables, counts: { available, occupied, reserved, total: tables.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/tables/:id/status', async (req, res) => {
  try {
    const tableId = req.params.id;
    const { status } = req.body; // 'free', 'occupied', 'reserved'
    const table = dbService.updateTableStatus(tableId, status);
    if (table) {
      return res.json({ success: true, table });
    }
    res.status(404).json({ success: false, message: 'Table not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 2. MENU API ---
app.get('/api/menu', async (req, res) => {
  try {
    const { category, search } = req.query;
    const items = dbService.getMenuItems(category, search);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 3. ORDERS API ---
app.get('/api/orders', async (req, res) => {
  try {
    const { filter } = req.query;
    const orders = dbService.getOrders(filter);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = dbService.getOrderById(orderId);
    if (order) {
      return res.json({ success: true, order });
    }
    res.status(404).json({ success: false, message: 'Order not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { tableNumber, items, notes } = req.body;
    const newOrder = dbService.createOrder(tableNumber, items, notes);
    res.json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body; // 'ready', 'served', 'delivered', 'in_kitchen'
    const order = dbService.updateOrderStatus(orderId, status);
    if (order) {
      return res.json({ success: true, order });
    }
    res.status(404).json({ success: false, message: 'Order not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 4. ATTENDANCE API ---
app.get('/api/attendance/current', async (req, res) => {
  try {
    const data = dbService.getCurrentShift();
    res.json({ success: true, shift: data.shift, history: data.history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/attendance/clock-in', async (req, res) => {
  try {
    const shift = dbService.clockIn();
    res.json({ success: true, shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/attendance/clock-out', async (req, res) => {
  try {
    const data = dbService.clockOut();
    res.json({ success: true, shift: data.shift, history: data.history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 5. PROFILE API ---
app.get('/api/profile', async (req, res) => {
  try {
    const profile = dbService.getProfile();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const updates = req.body;
    const profile = dbService.updateProfile(updates);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 6. STATS API ---
app.get('/api/stats', async (req, res) => {
  try {
    const stats = dbService.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Restaurant OS Backend Server running at http://localhost:${PORT}`);
  console.log(`💾 SQLite persistent database connected: restaurant.db\n`);
});

