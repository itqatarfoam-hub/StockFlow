const { db } = require('../config/database');

const settingsService = {
  async getSetting(key) {
    return new Promise((resolve, reject) => {
      db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? row.value : null);
      });
    });
  },

  async getLoginSettings() {
    return new Promise((resolve, reject) => {
      db.all('SELECT key, value FROM settings WHERE key LIKE "login.%"', [], (err, rows) => {
        if (err) {
          return reject(err);
        }

        const settings = {};
        rows.forEach(row => {
          const key = row.key.replace('login.', '');
          settings[key] = row.value;
        });

        resolve(settings);
      });
    });
  },

  async setSetting(key, value) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function (err) {
          if (err) {
            return reject(err);
          }

          resolve({ success: true });
        }
      );
    });
  },

  async setLoginSettings(settings) {
    return new Promise(async (resolve, reject) => {
      try {
        const promises = Object.entries(settings).map(([key, value]) => {
          return this.setSetting(`login.${key}`, value);
        });

        await Promise.all(promises);
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  },

  async getCompanyInfo() {
    return new Promise((resolve, reject) => {
      db.get('SELECT company_name, contact_email, phone_number, logo_path FROM login_settings WHERE id = 1', [], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row || { company_name: '', contact_email: '', phone_number: '', logo_path: '' });
      });
    });
  },

  async setCompanyInfo(info) {
    return new Promise((resolve, reject) => {
      const { company_name, contact_email, phone_number, logo_path } = info;

      // Build SQL based on whether logo_path is provided
      let sql, params;
      if (logo_path) {
        sql = `UPDATE login_settings 
               SET company_name = ?, contact_email = ?, phone_number = ?, logo_path = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = 1`;
        params = [company_name, contact_email, phone_number, logo_path];
      } else {
        sql = `UPDATE login_settings 
               SET company_name = ?, contact_email = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = 1`;
        params = [company_name, contact_email, phone_number];
      }

      db.run(sql, params, function (err) {
        if (err) {
          return reject(err);
        }

        resolve({ success: true });
      });
    });
  }
};

module.exports = settingsService;