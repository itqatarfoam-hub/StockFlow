const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');

const categoryService = {
  async getAllCategories() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories ORDER BY name ASC', [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  async getCategoryById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  },

  async createCategory(categoryData) {
    return new Promise((resolve, reject) => {
      const { name, description } = categoryData;

      // Check if category name already exists
      db.get('SELECT * FROM categories WHERE name = ?', [name], (err, existingCategory) => {
        if (err) {
          return reject(err);
        }

        if (existingCategory) {
          return resolve({ success: false, error: 'Category name already exists' });
        }

        const id = uuidv4();

        db.run(
          'INSERT INTO categories (id, name, description) VALUES (?, ?, ?)',
          [id, name, description],
          function(err) {
            if (err) {
              return reject(err);
            }

            resolve({ success: true, id });
          }
        );
      });
    });
  },

  async updateCategory(id, categoryData) {
    return new Promise((resolve, reject) => {
      const { name, description } = categoryData;

      db.run(
        'UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description, id],
        function(err) {
          if (err) {
            return reject(err);
          }

          if (this.changes === 0) {
            return resolve({ success: false, error: 'Category not found' });
          }

          resolve({ success: true });
        }
      );
    });
  },

  async deleteCategory(id) {
    return new Promise((resolve, reject) => {
      // Check if category has products
      db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id], (err, result) => {
        if (err) {
          return reject(err);
        }

        if (result.count > 0) {
          return resolve({ success: false, error: 'Cannot delete category with existing products' });
        }

        db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
          if (err) {
            return reject(err);
          }

          if (this.changes === 0) {
            return resolve({ success: false, error: 'Category not found' });
          }

          resolve({ success: true });
        });
      });
    });
  }
};

module.exports = categoryService;