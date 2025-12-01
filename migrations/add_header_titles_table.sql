-- ============================================
-- HEADER TITLES CUSTOMIZATION TABLE
-- Allows admin to customize topbar page titles
-- ============================================

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
);

-- Insert default values
INSERT OR IGNORE INTO header_titles (id, dashboard_title, sales_title, messaging_title, products_title, customers_title, settings_title, users_title, crm_title)
VALUES (1, '📊 Dashboard', '💰 Sales', '💬 Messaging', '📦 Item Management', '👥 Customers', '⚙️ Settings', '👤 User Management', '🎯 CRM');