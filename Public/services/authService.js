const bcrypt = require('bcrypt');
const { db } = require('../config/database');

const authService = {
  async login(username, password) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
          return reject(err);
        }

        if (!user) {
          return resolve({ success: false, error: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return resolve({ success: false, error: 'Invalid username or password' });
        }

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        resolve({ success: true, user: userWithoutPassword });
      });
    });
  },

  async verifyPassword(userId, password) {
    return new Promise((resolve, reject) => {
      db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) {
          return reject(err);
        }

        if (!user) {
          return resolve({ success: false, error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return resolve({ success: false, error: 'Current password is incorrect' });
        }

        resolve({ success: true });
      });
    });
  },

  async changePassword(userId, newPassword) {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.run(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, userId],
          function(err) {
            if (err) {
              return reject(err);
            }

            if (this.changes === 0) {
              return resolve({ success: false, error: 'User not found' });
            }

            resolve({ success: true });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = authService;