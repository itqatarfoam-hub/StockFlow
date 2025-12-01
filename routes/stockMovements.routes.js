const express = require('express');
const router = express.Router();
const stockMovementsService = require('../services/stockMovements.service');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/stock-movements
 * Get all stock movements
 */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const movements = await stockMovementsService.getAllStockMovements();
        res.json({
            success: true,
            movements
        });
    } catch (error) {
        console.error('❌ Error getting stock movements:', error);
        next(error);
    }
});

/**
 * POST /api/stock-movements
 * Create a new stock movement
 * Body: { product_id, type, quantity, reference }
 */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { product_id, type, quantity, reference } = req.body;

        // Validate required fields
        if (!product_id) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        if (!type) {
            return res.status(400).json({
                success: false,
                error: 'Movement type is required (in, out, or adjustment)'
            });
        }

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({
                success: false,
                error: 'Quantity is required'
            });
        }

        // Create stock movement
        const result = await stockMovementsService.createStockMovement({
            product_id,
            type,
            quantity: parseInt(quantity),
            reference: reference || ''
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('❌ Error creating stock movement:', error);

        // Send user-friendly error messages
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('Insufficient stock')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        next(error);
    }
});

/**
 * GET /api/stock-movements/product/:productId
 * Get stock movements for a specific product
 */
router.get('/product/:productId', requireAuth, async (req, res, next) => {
    try {
        const movements = await stockMovementsService.getStockMovementsByProduct(req.params.productId);
        res.json({
            success: true,
            movements
        });
    } catch (error) {
        console.error('❌ Error getting product stock movements:', error);
        next(error);
    }
});

module.exports = router;
