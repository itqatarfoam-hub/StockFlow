// ============================================
// SALES SERVICE
// Business logic for sales operations
// Author: itqatarfoam-hub
// Date: 2025-11-23 07:38:42 UTC
// ============================================

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SalesService {
  // Get all sales (admin only)
  async getAllSales() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          s.*,
          c.company_name as customer_name,
          c.contact_person,
          u.username as created_by_username
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.created_by = u.id
        ORDER BY s.sale_date DESC, s.created_at DESC
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Get sales by user ID
  async getSalesByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          s.*,
          c.company_name as customer_name,
          c.contact_person,
          u.username as created_by_username
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.created_by = ?
        ORDER BY s.sale_date DESC, s.created_at DESC
      `;

      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Get sale by ID
  async getSaleById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          s.*,
          c.company_name as customer_name,
          c.contact_person,
          u.username as created_by_username
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.id = ?
      `;

      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // Create new sale
  async createSale({ customer_id, sale_date, total_amount, items, created_by }) {
    return new Promise((resolve, reject) => {
      const saleId = uuidv4();

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          // Insert sale
          db.run(
            `INSERT INTO sales (id, customer_id, sale_date, total_amount, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [saleId, customer_id, sale_date, total_amount, created_by],
            function (err) {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }

              // Insert sale items
              const insertItem = db.prepare(
                `INSERT INTO sale_items (id, sale_id, product_id, qty, unit_price, selling_price, total)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
              );

              const updateStock = db.prepare(
                `UPDATE products SET stock = stock - ? WHERE id = ?`
              );

              for (const item of items) {
                const itemId = uuidv4();
                insertItem.run(
                  itemId,
                  saleId,
                  item.product_id,
                  item.qty,
                  item.unit_price,
                  item.selling_price,
                  item.total
                );

                // Update product stock
                updateStock.run(item.qty, item.product_id);
              }

              insertItem.finalize();
              updateStock.finalize();

              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                } else {
                  resolve(saleId);
                }
              });
            }
          );
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }

  // Get sale items
  async getSaleItems(saleId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          si.*,
          p.name as product_name,
          p.product_id
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `;

      db.all(query, [saleId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Delete sale (admin only)
  async deleteSale(saleId) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          // Get sale items to restore stock
          db.all(
            'SELECT product_id, qty FROM sale_items WHERE sale_id = ?',
            [saleId],
            (err, items) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }

              // Restore stock
              const restoreStock = db.prepare(
                'UPDATE products SET stock = stock + ? WHERE id = ?'
              );

              for (const item of items) {
                restoreStock.run(item.qty, item.product_id);
              }

              restoreStock.finalize();

              // Delete sale items
              db.run('DELETE FROM sale_items WHERE sale_id = ?', [saleId], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }

                // Delete sale
                db.run('DELETE FROM sales WHERE id = ?', [saleId], (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                  } else {
                    db.run('COMMIT', (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                      } else {
                        resolve(true);
                      }
                    });
                  }
                });
              });
            }
          );
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }

  // Get sales statistics
  async getSalesStats(userId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          COUNT(*) as total_sales,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as average_sale
        FROM sales
      `;

      const params = [];

      if (userId) {
        query += ' WHERE created_by = ?';
        params.push(userId);
      }

      db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total_sales: row.total_sales || 0,
            total_revenue: row.total_revenue || 0,
            average_sale: row.average_sale || 0
          });
        }
      });
    });
  }

  // Get top selling products
  async getTopSellingProducts(limit = 10, userId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          p.product_id,
          p.name,
          SUM(si.qty) as total_qty_sold,
          SUM(si.total) as total_revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
      `;

      const params = [];

      if (userId) {
        query += ' WHERE s.created_by = ?';
        params.push(userId);
      }

      query += `
        GROUP BY p.id, p.product_id, p.name
        ORDER BY total_qty_sold DESC
        LIMIT ?
      `;

      params.push(limit);

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Get sales by date range
  async getSalesByDateRange(startDate, endDate, userId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          s.*,
          c.company_name as customer_name,
          c.contact_person,
          u.username as created_by_username
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.sale_date BETWEEN ? AND ?
      `;

      const params = [startDate, endDate];

      if (userId) {
        query += ' AND s.created_by = ?';
        params.push(userId);
      }

      query += ' ORDER BY s.sale_date DESC, s.created_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
}

module.exports = new SalesService();