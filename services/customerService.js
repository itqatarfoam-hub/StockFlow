const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');

const customerService = {
  async getAllCustomers() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM customers ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  async getCustomerById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  },

  async createCustomer(customerData) {
    return new Promise((resolve, reject) => {
      const { company_name, contact_person, email, mobile, location, notes, created_by } = customerData;

      const id = uuidv4();

      db.run(
        'INSERT INTO customers (id, company_name, contact_person, email, mobile, location, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, company_name, contact_person, email, mobile, location, notes, created_by],
        function(err) {
          if (err) {
            return reject(err);
          }

          resolve({ success: true, id });
        }
      );
    });
  },

  async updateCustomer(id, customerData) {
    return new Promise((resolve, reject) => {
      const { company_name, contact_person, email, mobile, location, notes } = customerData;

      db.run(
        'UPDATE customers SET company_name = ?, contact_person = ?, email = ?, mobile = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [company_name, contact_person, email, mobile, location, notes, id],
        function(err) {
          if (err) {
            return reject(err);
          }

          if (this.changes === 0) {
            return resolve({ success: false, error: 'Customer not found' });
          }

          resolve({ success: true });
        }
      );
    });
  },

  async deleteCustomer(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
        if (err) {
          return reject(err);
        }

        if (this.changes === 0) {
          return resolve({ success: false, error: 'Customer not found' });
        }

        resolve({ success: true });
      });
    });
  }
};

module.exports = customerService;