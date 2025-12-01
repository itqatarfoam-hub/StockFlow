// ============================================
// USER SERVICE - COMPLETE
// Handle user database operations
// Author: itqatarfoam-hub
// Date: 2025-11-24 08:55:00 UTC
// ============================================

const { db } = require('../config/database');

class UserService {
  // Get user by username
  getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) {
            console.error('❌ Database error in getUserByUsername:', err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Get user by ID
  getUserById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, full_name, sales_code, email, role, created_at, updated_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error('❌ Database error in getUserById:', err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Get all users
  getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, username, full_name, sales_code, email, role, created_at, updated_at FROM users ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) {
            console.error('❌ Database error in getAllUsers:', err);
            reject(err);
          } else {
            console.log('✅ Retrieved', rows?.length || 0, 'users from database');
            resolve(rows || []);
          }
        }
      );
    });
  }

  // Create user
  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { id, username, password, full_name, sales_code, email, role, created_at, updated_at } = userData;
      
      console.log('💾 Inserting user into database:', {
        id,
        username,
        full_name,
        sales_code,
        email,
        role,
        password: '***'
      });

      db.run(
        `INSERT INTO users (id, username, password, full_name, sales_code, email, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, username, password, full_name, sales_code || null, email, role, created_at, updated_at],
        function(err) {
          if (err) {
            console.error('❌ Database error in createUser:', err);
            reject(err);
          } else {
            console.log('✅ User created in database:', username, 'rowid:', this.lastID);
            resolve({ id, username });
          }
        }
      );
    });
  }

  // Update user
  updateUser(id, userData) {
    return new Promise((resolve, reject) => {
      const { full_name, sales_code, email, role, password, updated_at } = userData;
      
      console.log('💾 Updating user in database:', id, {
        full_name,
        sales_code,
        email,
        role,
        password: password ? '***' : 'not changed'
      });

      let query = 'UPDATE users SET full_name = ?, sales_code = ?, email = ?, role = ?, updated_at = ?';
      let params = [full_name, sales_code || null, email, role, updated_at];
      
      if (password) {
        query += ', password = ?';
        params.push(password);
      }
      
      query += ' WHERE id = ?';
      params.push(id);

      db.run(query, params, function(err) {
        if (err) {
          console.error('❌ Database error in updateUser:', err);
          reject(err);
        } else if (this.changes === 0) {
          console.error('❌ User not found:', id);
          reject(new Error('User not found'));
        } else {
          console.log('✅ User updated in database, changes:', this.changes);
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  // Delete user
  deleteUser(id) {
    return new Promise((resolve, reject) => {
      console.log('🗑️ Deleting user from database:', id);

      db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            console.error('❌ Database error in deleteUser:', err);
            reject(err);
          } else if (this.changes === 0) {
            console.error('❌ User not found:', id);
            reject(new Error('User not found'));
          } else {
            console.log('✅ User deleted from database');
            resolve({ id, changes: this.changes });
          }
        }
      );
    });
  }

  // Check if username exists
  usernameExists(username, excludeId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
      let params = [username];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      db.get(query, params, (err, row) => {
        if (err) {
          console.error('❌ Database error in usernameExists:', err);
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }
}

// Export singleton instance
module.exports = new UserService();