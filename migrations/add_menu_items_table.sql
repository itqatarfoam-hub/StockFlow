-- Create menu_items table for dynamic menu management
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '📄',
  route VARCHAR(100) NOT NULL UNIQUE,
  permission VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default menu items
INSERT OR IGNORE INTO menu_items (name, icon, route, permission, display_order, is_active) VALUES
('Dashboard', '📊', 'dashboard', 'dashboard', 1, 1),
('CRM', '🎯', 'crm', 'crm', 2, 1),
('Sales', '💰', 'sales', 'sales', 3, 1),
('Messaging', '💬', 'messaging', 'messaging', 4, 1),
('Item Management', '📦', 'products', 'products', 5, 1),
('Customers', '👥', 'customers', 'customers', 6, 1),
('Settings', '⚙️', 'settings', 'settings', 7, 1);

-- Create menu_pages table for custom page content
CREATE TABLE IF NOT EXISTS menu_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER NOT NULL,
  page_title VARCHAR(200) NOT NULL,
  page_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);
