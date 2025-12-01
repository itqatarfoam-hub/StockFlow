// ============================================
// ROLES SERVICE
// Author: itqatarfoam-hub
// Date: 2025-11-23 08:15:00 UTC
// ============================================

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class RolesService {
  // Get all roles
  async getAllRoles() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM roles ORDER BY is_system DESC, name ASC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve((rows || []).map(role => ({
            ...role,
            permissions: JSON.parse(role.permissions || '[]')
          })));
        }
      });
    });
  }

  // Get role by ID
  async getRoleById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM roles WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            row.permissions = JSON.parse(row.permissions || '[]');
          }
          resolve(row || null);
        }
      });
    });
  }

  // Get role by name
  async getRoleByName(name) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM roles WHERE name = ?', [name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            row.permissions = JSON.parse(row.permissions || '[]');
          }
          resolve(row || null);
        }
      });
    });
  }

  // Create role
  async createRole({ name, display_name, permissions, description }) {
    return new Promise((resolve, reject) => {
      const roleId = uuidv4();
      const permissionsJson = JSON.stringify(permissions);

      db.run(
        `INSERT INTO roles (id, name, display_name, permissions, description, is_system)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [roleId, name, display_name, permissionsJson, description],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(roleId);
          }
        }
      );
    });
  }

  // Update role
  async updateRole(id, { display_name, permissions, description }) {
    return new Promise((resolve, reject) => {
      const permissionsJson = JSON.stringify(permissions);

      db.run(
        `UPDATE roles 
         SET display_name = ?, permissions = ?, description = ?, updated_at = datetime('now')
         WHERE id = ? AND is_system = 0`,
        [display_name, permissionsJson, description, id],
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Role not found or is a system role'));
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  // Delete role
  async deleteRole(id) {
    return new Promise((resolve, reject) => {
      // Check if any users have this role
      db.get('SELECT COUNT(*) as count FROM users WHERE role = (SELECT name FROM roles WHERE id = ?)', [id], (err, row) => {
        if (err) {
          return reject(err);
        }

        if (row.count > 0) {
          return reject(new Error(`Cannot delete role: ${row.count} user(s) are assigned to this role`));
        }

        db.run(
          'DELETE FROM roles WHERE id = ? AND is_system = 0',
          [id],
          function (err) {
            if (err) {
              reject(err);
            } else if (this.changes === 0) {
              reject(new Error('Role not found or is a system role'));
            } else {
              resolve(true);
            }
          }
        );
      });
    });
  }

  // Get available permissions
  getAvailablePermissions() {
    return [
      { id: 'dashboard', name: 'Dashboard', description: 'View dashboard and statistics', icon: '📊' },
      { id: 'sales', name: 'Sales', description: 'Create and manage sales', icon: '💰' },
      { id: 'messaging', name: 'Messaging', description: 'Chat with team members', icon: '💬' },
      { id: 'products', name: 'Item Management', description: 'Manage products and inventory', icon: '📦' },
      { id: 'customers', name: 'Customers', description: 'Manage customer information', icon: '👥' },
      { id: 'users', name: 'User Management', description: 'Manage users and roles', icon: '👤' },
      { id: 'settings', name: 'Settings', description: 'Configure system settings', icon: '⚙️' }
    ];
  }
}

module.exports = new RolesService();