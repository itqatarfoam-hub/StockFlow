// ============================================
// DATABASE CONFIGURATION - IMPROVED
// SQLite Database Setup & Initialization
// Author: itqatarfoam-hub
// Date: 2025-11-24 08:30:00 UTC
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'data', 'stockflow.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// ========== HELPER: Run SQL with Promise ==========
function runSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// ========== HELPER: Get Single Row ==========
function getRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// ========== HELPER: Get All Rows ==========
function getAllRows(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ========== CHECK IF COLUMN EXISTS ==========
async function columnExists(tableName, columnName) {
  const columns = await getAllRows(`PRAGMA table_info(${tableName})`);
  return columns.some(col => col.name === columnName);
}

// ========== ADD COLUMN IF NOT EXISTS ==========
async function addColumnIfNotExists(tableName, columnName, columnType) {
  const exists = await columnExists(tableName, columnName);

  if (!exists) {
    console.log(`🔧 Adding column ${columnName} to ${tableName}...`);
    await runSQL(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
    console.log(`✅ Column ${columnName} added to ${tableName}`);
  } else {
    console.log(`✓ Column ${columnName} already exists in ${tableName}`);
  }
}

// ========== INITIALIZE DATABASE ==========
async function initializeDatabase() {
  try {
    console.log('🔧 ========== DATABASE INITIALIZATION START ==========');

    // ========== CREATE USERS TABLE ==========
    console.log('📋 Creating users table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        email TEXT,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

    // ========== ADD SALES_CODE COLUMN TO USERS ==========
    await addColumnIfNotExists('users', 'sales_code', 'TEXT');

    // ========== ADD BROADCAST_APPROVAL COLUMN TO USERS ==========
    await addColumnIfNotExists('users', 'broadcast_approval', 'INTEGER DEFAULT 0');

    // ========== CREATE ROLES TABLE ==========
    console.log('📋 Creating roles table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        permissions TEXT NOT NULL,
        description TEXT,
        is_system INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Roles table ready');

    // ========== CREATE DEFAULT ROLES ==========
    await createDefaultRoles();

    // ========== CREATE CONVERSATIONS TABLE ==========
    console.log('📋 Creating conversations table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT CHECK(type IN ('group', 'private')) DEFAULT 'private',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Conversations table ready');

    // ========== CREATE CONVERSATION_PARTICIPANTS TABLE ==========
    console.log('📋 Creating conversation_participants table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_read_at DATETIME,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(conversation_id, user_id)
      )
    `);
    console.log('✅ Conversation participants table ready');

    // ========== CREATE MESSAGES TABLE ==========
    console.log('📋 Creating messages table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        message_type TEXT CHECK(message_type IN ('text', 'file', 'image')) DEFAULT 'text',
        content TEXT NOT NULL,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Messages table ready');

    // ========== CREATE MESSAGE_READS TABLE ==========
    console.log('📋 Creating message_reads table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS message_reads (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(message_id, user_id)
      )
    `);
    console.log('✅ Message reads table ready');

    // ========== CREATE CATEGORIES TABLE ==========
    console.log('📋 Creating categories table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table ready');

    // ========== CREATE LOCATIONS TABLE ==========
    console.log('📋 Creating locations table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Locations table ready');

    // ========== CREATE PRODUCTS TABLE ==========
    console.log('📋 Creating products table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        product_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category_id TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        unit_price REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      )
    `);
    console.log('✅ Products table ready');

    // ========== ADD LOCATION_ID COLUMN TO PRODUCTS ==========
    await addColumnIfNotExists('products', 'location_id', 'TEXT REFERENCES locations(id)');

    // ========== CREATE CUSTOMERS TABLE ==========
    console.log('📋 Creating customers table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT,
        mobile TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Customers table ready');

    // ========== CREATE SALES TABLE ==========
    console.log('📋 Creating sales table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        sale_date DATE NOT NULL,
        total_amount REAL NOT NULL,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Sales table ready');

    // ========== ADD CREATED_BY TO SALES IF MISSING ==========
    await addColumnIfNotExists('sales', 'created_by', 'TEXT REFERENCES users(id)');

    // ========== CREATE SALE_ITEMS TABLE ==========
    console.log('📋 Creating sale_items table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        qty INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      )
    `);
    console.log('✅ Sale items table ready');

    // ========== CREATE STOCK_MOVEMENTS TABLE ==========
    console.log('📋 Creating stock_movements table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        type TEXT CHECK(type IN ('in', 'out', 'adjustment')) NOT NULL,
        quantity INTEGER NOT NULL,
        stock_before INTEGER NOT NULL,
        stock_after INTEGER NOT NULL,
        reference TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Stock movements table ready');

    // ========== CREATE LOGIN_SETTINGS TABLE ==========
    console.log('📋 Creating login_settings table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS login_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        logo TEXT DEFAULT '📊',
        title TEXT DEFAULT 'StockFlow',
        subtitle TEXT DEFAULT 'Inventory & Sales Management',
        demo_label TEXT DEFAULT 'Demo Credentials',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Login settings table ready');

    // ========== CREATE NOTIFICATIONS TABLE ==========
    console.log('📋 Creating notifications table...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('password_reset', 'system', 'message', 'alert')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        from_user_id TEXT,
        to_user_id TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await runSQL(`CREATE INDEX IF NOT EXISTS idx_notifications_to_user ON notifications(to_user_id, is_read)`);
    await runSQL(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`);
    console.log('✅ Notifications table ready');

    // ========== CREATE HEADER_TITLES TABLE ==========
    console.log('📋 Creating header_titles table...');
    await runSQL(`
  CREATE TABLE IF NOT EXISTS header_titles (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    dashboard_title TEXT DEFAULT '📊 Dashboard',
    sales_title TEXT DEFAULT '💰 Sales',
    messaging_title TEXT DEFAULT '💬 Messaging',
    products_title TEXT DEFAULT '📦 Item Management',
    customers_title TEXT DEFAULT '👥 Customers',
    settings_title TEXT DEFAULT '⚙️ Settings',
    users_title TEXT DEFAULT '👤 User Management',
    crm_title TEXT DEFAULT '🎯 CRM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
    console.log('✅ Header titles table ready');


    // ========== CREATE DEFAULT DATA ==========
    await createDefaultAdmin();
    await createDefaultSettings();
    await createDefaultGroupChat();
    await createDefaultLocations();  // Add default locations
    await createDefaultHeaderTitles();  // Add default header titles

    console.log('✅ ========== DATABASE INITIALIZATION COMPLETE ==========\n');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// ========== CREATE DEFAULT ROLES ==========
async function createDefaultRoles() {
  console.log('🔧 Creating default roles...');

  const defaultRoles = [
    {
      id: uuidv4(),
      name: 'admin',
      display_name: 'Administrator',
      permissions: JSON.stringify(['dashboard', 'crm', 'sales', 'messaging', 'products', 'customers', 'settings', 'reports', 'hrm']),
      description: 'Full system access',
      is_system: 1
    },
    {
      id: uuidv4(),
      name: 'manager',
      display_name: 'Manager',
      permissions: JSON.stringify(['dashboard', 'sales', 'messaging', 'products', 'customers', 'settings']),
      description: 'Manage inventory and sales',
      is_system: 1
    },
    {
      id: uuidv4(),
      name: 'user',
      display_name: 'User',
      permissions: JSON.stringify(['dashboard', 'sales', 'messaging', 'customers']),
      description: 'Basic access to sales and messaging',
      is_system: 1
    }
  ];

  for (const role of defaultRoles) {
    const existingRole = await getRow('SELECT id FROM roles WHERE name = ?', [role.name]);

    if (!existingRole) {
      await runSQL(
        `INSERT INTO roles (id, name, display_name, permissions, description, is_system)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [role.id, role.name, role.display_name, role.permissions, role.description, role.is_system]
      );
      console.log(`  ✓ Created role: ${role.display_name}`);
    } else {
      console.log(`  ✓ Role already exists: ${role.display_name}`);
    }
  }

  console.log('✅ Default roles initialized');
}

// ========== CREATE DEFAULT ADMIN USER ==========
async function createDefaultAdmin() {
  console.log('🔧 Creating default admin user...');

  const existingAdmin = await getRow('SELECT id FROM users WHERE username = ?', ['admin']);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();

    await runSQL(
      `INSERT INTO users (id, username, password, full_name, email, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, 'admin', hashedPassword, 'Administrator', 'admin@stockflow.com', 'admin']
    );

    console.log('✅ Default admin created (username: admin, password: admin123)');
  } else {
    console.log('✓ Admin user already exists');
  }
}

// ========== CREATE DEFAULT SETTINGS ==========
async function createDefaultSettings() {
  console.log('🔧 Creating default login settings...');

  const existingSettings = await getRow('SELECT id FROM login_settings WHERE id = 1');

  if (!existingSettings) {
    await runSQL(
      `INSERT INTO login_settings (id, logo, title, subtitle, demo_label)
       VALUES (1, '📊', 'StockFlow', 'Inventory & Sales Management', 'Demo Credentials')`
    );

    console.log('✅ Default settings initialized');
  } else {
    console.log('✓ Settings already exist');
  }
}

// ========== CREATE DEFAULT GROUP CHAT ==========
async function createDefaultGroupChat() {
  console.log('🔧 Creating default group chat...');

  const existingChat = await getRow(
    'SELECT id FROM conversations WHERE type = ? AND name = ?',
    ['group', 'General Chat']
  );

  if (!existingChat) {
    const adminUser = await getRow('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);

    if (adminUser) {
      const groupId = uuidv4();

      await runSQL(
        `INSERT INTO conversations (id, name, type, created_by)
         VALUES (?, ?, ?, ?)`,
        [groupId, 'General Chat', 'group', adminUser.id]
      );

      console.log('✅ Default group chat created');
    } else {
      console.warn('⚠️ No admin user found, skipping group chat creation');
    }
  } else {
    console.log('✓ Group chat already exists');
  }
}

// ========== CREATE DEFAULT LOCATIONS ==========
async function createDefaultLocations() {
  console.log('🔧 Creating default locations...');

  const defaultLocations = [
    { id: 'LOC001', name: 'Warehouse A', description: 'Main warehouse storage area' },
    { id: 'LOC002', name: 'Warehouse B', description: 'Secondary warehouse' },
    { id: 'LOC003', name: 'Showroom', description: 'Customer display area' },
    { id: 'LOC004', name: 'Storage Room', description: 'Back storage' }
  ];

  for (const location of defaultLocations) {
    const existingLocation = await getRow('SELECT id FROM locations WHERE id = ?', [location.id]);

    if (!existingLocation) {
      await runSQL(
        `INSERT INTO locations (id, name, description)
         VALUES (?, ?, ?)`,
        [location.id, location.name, location.description]
      );
      console.log(`  ✓ Created location: ${location.name}`);
    } else {
      console.log(`  ✓ Location already exists: ${location.name}`);
    }
  }

  console.log('✅ Default locations initialized');
}

// ========== CREATE DEFAULT HEADER TITLES ==========
async function createDefaultHeaderTitles() {
  console.log('🔧 Creating default header titles...');

  const existingTitles = await getRow('SELECT id FROM header_titles WHERE id = 1');

  if (!existingTitles) {
    await runSQL(
      `INSERT INTO header_titles (id, dashboard_title, sales_title, messaging_title, products_title, customers_title, settings_title, users_title, crm_title)
       VALUES (1, '📊 Dashboard', '💰 Sales', '💬 Messaging', '📦 Item Management', '👥 Customers', '⚙️ Settings', '👤 User Management', '🎯 CRM')`
    );
    console.log('✅ Default header titles initialized');
  } else {
    console.log('✓ Header titles already exist');
  }
}
// ========== CLOSE DATABASE ==========
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
        reject(err);
      } else {
        console.log('✅ Database connection closed');
        resolve();
      }
    });
  });
}

// ========== EXPORT ==========
module.exports = {
  db,
  initializeDatabase,
  closeDatabase,
  runSQL,
  getRow,
  getAllRows
};
