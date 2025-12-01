const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');

const productService = {
  async getAllProducts() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name, l.name as location_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN locations l ON p.location_id = l.id
        ORDER BY p.created_at DESC
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  async getProductById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, c.name as category_name, l.name as location_name
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN locations l ON p.location_id = l.id
        WHERE p.id = ?
      `;

      db.get(query, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  },

  async createProduct(productData) {
    return new Promise((resolve, reject) => {
      const { product_id, name, description, category_id, location_id, stock, unit_price, created_at } = productData;

      console.log('🔍 productService.createProduct called');
      console.log('   location_id:', location_id);
      console.log('   typeof location_id:', typeof location_id);

      // Check if product_id already exists
      db.get('SELECT * FROM products WHERE product_id = ?', [product_id], (err, existingProduct) => {
        if (err) {
          return reject(err);
        }

        if (existingProduct) {
          return resolve({ success: false, error: 'Product ID already exists' });
        }

        const id = uuidv4();

        console.log('📝 Executing INSERT with location_id:', location_id);

        db.run(
          'INSERT INTO products (id, product_id, name, description, category_id, location_id, stock, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, product_id, name, description, category_id, location_id, stock, unit_price, created_at],
          function (err) {
            if (err) {
              console.error('❌ INSERT error:', err);
              return reject(err);
            }

            console.log('✅ Product created successfully with ID:', id);
            resolve({ success: true, id });
          }
        );
      });
    });
  },

  async updateProduct(id, productData) {
    return new Promise((resolve, reject) => {
      const { product_id, name, description, category_id, location_id, stock, unit_price, created_at } = productData;

      console.log('🔍 productService.updateProduct called');
      console.log('   location_id:', location_id);

      db.run(
        'UPDATE products SET product_id = ?, name = ?, description = ?, category_id = ?, location_id = ?, stock = ?, unit_price = ?, created_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [product_id, name, description, category_id, location_id, stock, unit_price, created_at, id],
        function (err) {
          if (err) {
            console.error('❌ UPDATE error:', err);
            return reject(err);
          }

          if (this.changes === 0) {
            return resolve({ success: false, error: 'Product not found' });
          }

          console.log('✅ Product updated successfully');
          resolve({ success: true });
        }
      );
    });
  },

  async updateStock(id, stock) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [stock, id],
        function (err) {
          if (err) {
            return reject(err);
          }

          if (this.changes === 0) {
            return resolve({ success: false, error: 'Product not found' });
          }

          resolve({ success: true });
        }
      );
    });
  },

  async deleteProduct(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) {
          return reject(err);
        }

        if (this.changes === 0) {
          return resolve({ success: false, error: 'Product not found' });
        }

        resolve({ success: true });
      });
    });
  }
};

module.exports = productService;