const { db } = require('../config/database');

/**
 * Stock Movements Service
 * Handles stock movement tracking and product stock updates
 */

/**
 * Get all stock movements ordered by date (most recent first)
 */
function getAllStockMovements() {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT 
        sm.id,
        sm.product_id,
        sm.type,
        sm.quantity,
        sm.stock_before,
        sm.stock_after,
        sm.reference,
        sm.created_at,
        p.name as product_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
      LIMIT 100
    `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching stock movements:', err);
                return reject(err);
            }
            resolve(rows || []);
        });
    });
}

/**
 * Create a new stock movement and update product stock
 * @param {Object} data - Movement data
 * @param {string} data.product_id - Product ID
 * @param {string} data.type - Movement type: 'in', 'out', or 'adjustment'
 * @param {number} data.quantity - Quantity (positive for in, negative for out)
 * @param {string} data.reference - Reference note
 */
function createStockMovement(data) {
    return new Promise((resolve, reject) => {
        const { product_id, type, quantity, reference } = data;

        // Validate inputs
        if (!product_id || !type || quantity === undefined) {
            return reject(new Error('Missing required fields: product_id, type, quantity'));
        }

        if (!['in', 'out', 'adjustment'].includes(type)) {
            return reject(new Error('Invalid type. Must be: in, out, or adjustment'));
        }

        // Start transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Get current product stock
            db.get(
                'SELECT id, stock FROM products WHERE id = ?',
                [product_id],
                (err, product) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    if (!product) {
                        db.run('ROLLBACK');
                        return reject(new Error('Product not found'));
                    }

                    const stockBefore = product.stock;
                    const stockAfter = stockBefore + quantity;

                    // Prevent negative stock
                    if (stockAfter < 0) {
                        db.run('ROLLBACK');
                        return reject(new Error('Insufficient stock. Cannot reduce below 0.'));
                    }

                    // Update product stock
                    db.run(
                        'UPDATE products SET stock = ? WHERE id = ?',
                        [stockAfter, product_id],
                        (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }

                            // Create stock movement record
                            const now = new Date().toISOString();
                            db.run(
                                `INSERT INTO stock_movements 
                 (product_id, type, quantity, stock_before, stock_after, reference, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [product_id, type, quantity, stockBefore, stockAfter, reference || '', now],
                                function (err) {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }

                                    // Commit transaction
                                    db.run('COMMIT', (err) => {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return reject(err);
                                        }

                                        resolve({
                                            success: true,
                                            id: this.lastID,
                                            stock_before: stockBefore,
                                            stock_after: stockAfter
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    });
}

/**
 * Get stock movements for a specific product
 */
function getStockMovementsByProduct(productId) {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT *
      FROM stock_movements
      WHERE product_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `;

        db.all(query, [productId], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching product stock movements:', err);
                return reject(err);
            }
            resolve(rows || []);
        });
    });
}

module.exports = {
    getAllStockMovements,
    createStockMovement,
    getStockMovementsByProduct
};
