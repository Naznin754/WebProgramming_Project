const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDB() {
  console.log('🔄 Checking database connection and initializing schema...');
  try {
    const sqlPath = path.join(__dirname, 'restaurant.sql');
    if (!fs.existsSync(sqlPath)) {
      console.warn('⚠️ restaurant.sql not found.');
      return;
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    const result = await db.query(sqlContent);

    if (result) {
      console.log('✅ PostgreSQL schema successfully executed from restaurant.sql!');
      
      // Check if menu_items exist, if not seed initial data
      const checkMenu = await db.query('SELECT COUNT(*) FROM menu_items;');
      if (checkMenu && parseInt(checkMenu.rows[0].count, 10) === 0) {
        console.log('🌱 Seeding default menu items into PostgreSQL database...');
        for (const item of db.memoryStore.menu_items) {
          await db.query(
            `INSERT INTO menu_items (name, price, category, prep_time_minutes, is_approved)
             VALUES ($1, $2, $3, $4, $5);`,
            [item.name, item.price, item.category, item.prep_time_minutes, item.is_approved]
          );
        }
      }

      // Check if tables exist, if not seed 24 tables
      const checkTables = await db.query('SELECT COUNT(*) FROM tables;');
      if (checkTables && parseInt(checkTables.rows[0].count, 10) === 0) {
        console.log('🌱 Seeding default restaurant tables into PostgreSQL database...');
        for (const t of db.memoryStore.tables) {
          await db.query(
            `INSERT INTO tables (table_number, capacity, status)
             VALUES ($1, $2, $3);`,
            [t.table_number, t.capacity, t.status === 'free' ? 'free' : (t.status === 'occupied' ? 'occupied' : 'reserved')]
          );
        }
      }

      console.log('🚀 PostgreSQL database is ready!');
    } else {
      console.log('💡 Running in flexible mode with ready-to-use in-memory database store.');
    }
  } catch (err) {
    console.warn('⚠️ Database init notice:', err.message);
  }
}

module.exports = initDB;
