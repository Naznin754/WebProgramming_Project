const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let usePostgres = false;
let sqliteDb = null;

// Initialize SQLite database file (restaurant.db)
const dbPath = path.join(__dirname, 'restaurant.db');
sqliteDb = new DatabaseSync(dbPath);

function initSqliteSchema() {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      table_number INTEGER UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'free'
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT,
      prep_time_minutes INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 1,
      description TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number INTEGER UNIQUE NOT NULL,
      table_id TEXT,
      table_number INTEGER NOT NULL,
      waiter_id TEXT,
      status TEXT NOT NULL DEFAULT 'in_kitchen',
      priority INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      name TEXT NOT NULL,
      note TEXT,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      clock_in TEXT NOT NULL,
      clock_out TEXT NOT NULL,
      hours TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS current_shift (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      clockedIn INTEGER DEFAULT 0,
      clockInTime TEXT,
      staffId TEXT,
      staffName TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT,
      fullName TEXT,
      role TEXT,
      email TEXT,
      phone TEXT,
      experienceYears INTEGER,
      cuisineSpecialty TEXT,
      avgDailyOrders INTEGER,
      primaryStation TEXT,
      avatarUrl TEXT
    );
  `);

  // Seed default data if empty
  seedSqliteData();
}

function seedSqliteData() {
  // 1. Tables
  const tableCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM tables').get();
  if (tableCount.count === 0) {
    const insertTable = sqliteDb.prepare('INSERT INTO tables (id, table_number, capacity, status) VALUES (?, ?, ?, ?)');
    for (let i = 0; i < 24; i++) {
      const tNum = i + 1;
      const capacity = [2, 4, 6, 8, 4, 2, 6, 4][i % 8];
      let status = 'free';
      if (i === 0 || i === 5 || i === 16 || i === 20) status = 'occupied';
      else if (i === 2 || i === 6 || i === 8 || i === 9 || i === 13 || i === 14) status = 'reserved';
      insertTable.run(`table-uuid-${tNum}`, tNum, capacity, status);
    }
  }

  // 2. Menu Items
  const menuCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM menu_items').get();
  if (menuCount.count === 0) {
    const insertMenu = sqliteDb.prepare('INSERT INTO menu_items (id, name, price, category, prep_time_minutes, is_approved, description, image_url) VALUES (?, ?, ?, ?, ?, 1, ?, ?)');
    const defaultMenu = [
      { id: 'menu-1', name: 'Salmon Nigiri', price: 12.00, category: 'Sushi', prep_time_minutes: 10, description: 'Fresh Atlantic salmon, wasabi, soy', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop' },
      { id: 'menu-2', name: 'Dry Aged Burger', price: 18.50, category: 'Mains', prep_time_minutes: 15, description: 'Prime beef patty, aged cheddar, brioche bun', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
      { id: 'menu-3', name: 'Truffle Parmesan Fries', price: 8.50, category: 'Small Plates', prep_time_minutes: 8, description: 'Hand-cut fries, truffle oil, grated parmesan', image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&h=300&fit=crop' },
      { id: 'menu-4', name: 'Salmon Tartare', price: 14.00, category: 'Small Plates', prep_time_minutes: 12, description: 'Fresh diced salmon, avocado, capers, lemon zest', image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop' },
      { id: 'menu-5', name: 'Ribeye Steak', price: 34.00, category: 'Mains', prep_time_minutes: 20, description: '12oz grass-fed ribeye with herb butter', image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop' },
      { id: 'menu-6', name: 'Margherita Pizza', price: 16.00, category: 'Mains', prep_time_minutes: 12, description: 'San Marzano tomatoes, fresh mozzarella, basil', image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop' },
      { id: 'menu-7', name: 'Craft Cola', price: 4.50, category: 'Beverages', prep_time_minutes: 2, description: 'House-made artisanal cola', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop' },
      { id: 'menu-8', name: 'Sparkling Water', price: 3.50, category: 'Beverages', prep_time_minutes: 1, description: 'Chilled sparkling mineral water', image_url: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=300&fit=crop' }
    ];
    for (const item of defaultMenu) {
      insertMenu.run(item.id, item.name, item.price, item.category, item.prep_time_minutes, item.description, item.image_url);
    }
  }

  // 3. Orders & Order Items
  const orderCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM orders').get();
  if (orderCount.count === 0) {
    const insertOrder = sqliteDb.prepare('INSERT INTO orders (id, order_number, table_id, table_number, waiter_id, status, priority, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insertItem = sqliteDb.prepare('INSERT INTO order_items (id, order_id, name, note, price) VALUES (?, ?, ?, ?, ?)');

    const defaultOrders = [
      {
        id: 'order-2409', order_number: 2409, table_id: 'table-uuid-3', table_number: 3, waiter_id: 'd9b2e1a4-8f3c-4b5a-9e1d-2c3b4a5e6f7a', status: 'ready', priority: 0, created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(), notes: '',
        items: [
          { name: '2x Dry Aged Burger', note: 'No Pickles', price: 37.00 },
          { name: '1x Truffle Fries', note: 'Extra Crispy', price: 8.50 },
          { name: '1x Craft Cola', note: 'Large', price: 4.50 }
        ]
      },
      {
        id: 'order-2412', order_number: 2412, table_id: 'table-uuid-3', table_number: 3, waiter_id: 'd9b2e1a4-8f3c-4b5a-9e1d-2c3b4a5e6f7a', status: 'in_kitchen', priority: 0, created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), notes: '',
        items: [
          { name: '1x Salmon Tartare', note: 'Extra Lemon', price: 14.00 },
          { name: '2x Sparkling Water', note: 'Chilled', price: 7.00 }
        ]
      },
      {
        id: 'order-2398', order_number: 2398, table_id: 'table-uuid-7', table_number: 7, waiter_id: 'd9b2e1a4-8f3c-4b5a-9e1d-2c3b4a5e6f7a', status: 'ready', priority: 1, created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(), notes: '',
        items: [
          { name: '1x Ribeye Steak', note: 'Medium Rare', price: 34.00 },
          { name: '1x Truffle Fries', note: 'X-Sour Cream', price: 8.50 }
        ]
      },
      {
        id: 'order-2385', order_number: 2385, table_id: 'table-uuid-12', table_number: 12, waiter_id: 'd9b2e1a4-8f3c-4b5a-9e1d-2c3b4a5e6f7a', status: 'served', priority: 0, created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), notes: '',
        items: [
          { name: '1x Margherita Pizza', note: 'Completed', price: 16.00 }
        ]
      }
    ];

    for (const o of defaultOrders) {
      insertOrder.run(o.id, o.order_number, o.table_id, o.table_number, o.waiter_id, o.status, o.priority, o.created_at, o.notes);
      for (let idx = 0; idx < o.items.length; idx++) {
        const item = o.items[idx];
        insertItem.run(`item-${o.id}-${idx}`, o.id, item.name, item.note, item.price);
      }
    }
  }

  // 4. Attendance
  const attCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM attendance').get();
  if (attCount.count === 0) {
    const insertAtt = sqliteDb.prepare('INSERT INTO attendance (id, date, clock_in, clock_out, hours, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const defaultAtt = [
      { id: 'att-1', date: 'Oct 23, 2024', clock_in: '08:02 AM', clock_out: '04:15 PM', hours: '8h 13m', status: 'Full Day', created_at: 4 },
      { id: 'att-2', date: 'Oct 22, 2024', clock_in: '07:58 AM', clock_out: '04:02 PM', hours: '8h 04m', status: 'Full Day', created_at: 3 },
      { id: 'att-3', date: 'Oct 21, 2024', clock_in: '08:05 AM', clock_out: '04:30 PM', hours: '8h 25m', status: 'Full Day', created_at: 2 },
      { id: 'att-4', date: 'Oct 20, 2024', clock_in: '08:00 AM', clock_out: '12:00 PM', hours: '4h 00m', status: 'Half Day', created_at: 1 }
    ];
    for (const a of defaultAtt) {
      insertAtt.run(a.id, a.date, a.clock_in, a.clock_out, a.hours, a.status, a.created_at);
    }
  }

  // 5. Current Shift
  const shiftCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM current_shift').get();
  if (shiftCount.count === 0) {
    sqliteDb.prepare('INSERT INTO current_shift (id, clockedIn, clockInTime, staffId, staffName, role) VALUES (1, 0, NULL, ?, ?, ?)')
      .run('#4402', 'Alex Rivera', 'Waitstaff / Server');
  }

  // 6. Profile
  const profileCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM profile').get();
  if (profileCount.count === 0) {
    sqliteDb.prepare(`
      INSERT INTO profile (id, name, fullName, role, email, phone, experienceYears, cuisineSpecialty, avgDailyOrders, primaryStation, avatarUrl)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Chef Marco', 'Marco Santini', 'Executive Chef', 'm.santini@kitchenportal.com', '+1 (555) 012-3456',
      12, 'Mediterranean', 45, 'Grill', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=220&h=220&fit=crop&crop=face'
    );
  }
}

// Initialize SQLite Schema and Seeds
initSqliteSchema();

// Data helper functions operating directly on persistent SQLite DB
const dbService = {
  getTables() {
    return sqliteDb.prepare('SELECT * FROM tables ORDER BY table_number ASC').all();
  },

  updateTableStatus(tableId, status) {
    const tNum = parseInt(tableId, 10);
    if (!isNaN(tNum) && tNum > 0) {
      sqliteDb.prepare('UPDATE tables SET status = ? WHERE table_number = ? OR id = ?').run(status, tNum, String(tableId));
    } else {
      sqliteDb.prepare('UPDATE tables SET status = ? WHERE id = ?').run(status, String(tableId));
    }
    return sqliteDb.prepare('SELECT * FROM tables WHERE id = ? OR table_number = ?').get(String(tableId), isNaN(tNum) ? -1 : tNum);
  },

  getMenuItems(category, search) {
    let queryStr = 'SELECT * FROM menu_items WHERE is_approved = 1';
    const params = [];
    if (category && category !== 'All Items' && category !== 'All') {
      queryStr += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }
    if (search) {
      queryStr += ' AND LOWER(name) LIKE LOWER(?)';
      params.push(`%${search}%`);
    }
    queryStr += ' ORDER BY category, name ASC';
    return sqliteDb.prepare(queryStr).all(...params);
  },

  getOrders(filter) {
    let queryStr = 'SELECT * FROM orders';
    if (filter === 'ready') {
      queryStr += " WHERE status = 'ready'";
    } else if (filter === 'delivered') {
      queryStr += " WHERE status = 'served' OR status = 'delivered'";
    } else if (filter === 'in_kitchen' || filter === 'kitchen') {
      queryStr += " WHERE status = 'in_kitchen'";
    }
    queryStr += ' ORDER BY rowid DESC';

    const orders = sqliteDb.prepare(queryStr).all();
    for (const o of orders) {
      const items = sqliteDb.prepare('SELECT name, note, price FROM order_items WHERE order_id = ?').all(o.id);
      o.items = items;
      o.priority = !!o.priority;
    }
    return orders;
  },

  getOrderById(id) {
    const tNum = parseInt(id, 10);
    const order = sqliteDb.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(String(id), isNaN(tNum) ? -1 : tNum);
    if (order) {
      const items = sqliteDb.prepare('SELECT name, note, price FROM order_items WHERE order_id = ?').all(order.id);
      order.items = items;
      order.priority = !!order.priority;
    }
    return order;
  },

  createOrder(tableNumber, items, notes) {
    const countRow = sqliteDb.prepare('SELECT COUNT(*) as cnt FROM orders').get();
    const newOrderNum = 2400 + (countRow ? countRow.cnt : 0) + 1;
    const newOrderId = `order-${newOrderNum}`;
    const tableNumInt = parseInt(tableNumber, 10) || 14;
    const createdAt = new Date().toISOString();

    sqliteDb.prepare(`
      INSERT INTO orders (id, order_number, table_id, table_number, waiter_id, status, priority, created_at, notes)
      VALUES (?, ?, ?, ?, ?, 'in_kitchen', 0, ?, ?)
    `).run(newOrderId, newOrderNum, `table-uuid-${tableNumInt}`, tableNumInt, 'd9b2e1a4-8f3c-4b5a-9e1d-2c3b4a5e6f7a', createdAt, notes || '');

    for (let idx = 0; idx < (items || []).length; idx++) {
      const i = items[idx];
      const itemName = i.name.startsWith(i.quantity + 'x') ? i.name : `${i.quantity}x ${i.name}`;
      const itemPrice = (i.price || 0) * (i.quantity || 1);
      sqliteDb.prepare(`
        INSERT INTO order_items (id, order_id, name, note, price)
        VALUES (?, ?, ?, ?, ?)
      `).run(`item-${newOrderId}-${idx}-${Date.now()}`, newOrderId, itemName, i.note || '', itemPrice);
    }

    // Update table status to occupied
    sqliteDb.prepare('UPDATE tables SET status = ? WHERE table_number = ?').run('occupied', tableNumInt);

    return dbService.getOrderById(newOrderId);
  },

  updateOrderStatus(orderId, status) {
    const tNum = parseInt(orderId, 10);
    sqliteDb.prepare('UPDATE orders SET status = ? WHERE id = ? OR order_number = ?').run(status, String(orderId), isNaN(tNum) ? -1 : tNum);
    return dbService.getOrderById(orderId);
  },

  getCurrentShift() {
    const shiftRow = sqliteDb.prepare('SELECT * FROM current_shift WHERE id = 1').get();
    const shift = shiftRow ? {
      clockedIn: !!shiftRow.clockedIn,
      clockInTime: shiftRow.clockInTime,
      staffId: shiftRow.staffId,
      staffName: shiftRow.staffName,
      role: shiftRow.role
    } : { clockedIn: false, clockInTime: null, staffId: '#4402', staffName: 'Alex Rivera', role: 'Waitstaff / Server' };

    const history = sqliteDb.prepare('SELECT * FROM attendance ORDER BY created_at DESC, rowid DESC').all();
    return { shift, history };
  },

  clockIn() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sqliteDb.prepare('UPDATE current_shift SET clockedIn = 1, clockInTime = ? WHERE id = 1').run(timeStr);
    return dbService.getCurrentShift().shift;
  },

  clockOut() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const { shift } = dbService.getCurrentShift();

    if (shift && shift.clockedIn) {
      const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      sqliteDb.prepare(`
        INSERT INTO attendance (id, date, clock_in, clock_out, hours, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(`att-${Date.now()}`, todayStr, shift.clockInTime || '08:00 AM', timeStr, '8h 00m', 'Full Day', Date.now());
    }

    sqliteDb.prepare('UPDATE current_shift SET clockedIn = 0, clockInTime = NULL WHERE id = 1').run();
    return dbService.getCurrentShift();
  },

  getProfile() {
    return sqliteDb.prepare('SELECT * FROM profile WHERE id = 1').get();
  },

  updateProfile(updates) {
    const current = dbService.getProfile() || {};
    const updated = { ...current, ...updates };

    sqliteDb.prepare(`
      UPDATE profile SET
        name = ?, fullName = ?, role = ?, email = ?, phone = ?,
        experienceYears = ?, cuisineSpecialty = ?, avgDailyOrders = ?,
        primaryStation = ?, avatarUrl = ?
      WHERE id = 1
    `).run(
      updated.name || 'Chef Marco',
      updated.fullName || updated.name || 'Marco Santini',
      updated.role || 'Executive Chef',
      updated.email || 'm.santini@kitchenportal.com',
      updated.phone || '+1 (555) 012-3456',
      parseInt(updated.experienceYears, 10) || 12,
      updated.cuisineSpecialty || 'Mediterranean',
      parseInt(updated.avgDailyOrders, 10) || 45,
      updated.primaryStation || 'Grill',
      updated.avatarUrl || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=220&h=220&fit=crop&crop=face'
    );
    return dbService.getProfile();
  },

  getStats() {
    const tables = sqliteDb.prepare('SELECT * FROM tables').all();
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    const available = tables.length - occupied - reserved;
    const profile = dbService.getProfile();

    return {
      totalTables: tables.length,
      occupied,
      reserved,
      available,
      turnoverRate: '1.2h',
      avgDailyOrders: profile ? profile.avgDailyOrders : 45
    };
  }
};

module.exports = {
  dbService,
  sqliteDb
};

