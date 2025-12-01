const express = require('express');
const router = express.Router();
const salesService = require('../services/salesservice');
const { requireAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all sales (filtered by user)
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    
    // Admin can see all sales, others see only their own
    const sales = userRole === 'admin' 
      ? await salesService.getAllSales()
      : await salesService.getSalesByUser(userId);
    
    logger.info(`User ${req.session.user.username} (${userRole}) retrieved ${sales.length} sales`);
    res.json({ sales });
  } catch (error) {
    logger.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Create new sale
router.post('/', requireAuth, async (req, res) => {
  try {
    const { customer_id, sale_date, total_amount, items } = req.body;
    const userId = req.session.user.id;

    if (!customer_id || !sale_date || !total_amount || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const saleId = await salesService.createSale({
      customer_id,
      sale_date,
      total_amount,
      items,
      created_by: userId
    });

    logger.info(`Sale created by ${req.session.user.username}: ${saleId}`);
    res.status(201).json({ 
      success: true, 
      id: saleId,
      message: 'Sale created successfully'
    });
  } catch (error) {
    logger.error('Error creating sale:', error);
    res.status(500).json({ error: error.message || 'Failed to create sale' });
  }
});

// Get sale by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    const sale = await salesService.getSaleById(req.params.id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Check if user has permission to view this sale
    if (userRole !== 'admin' && sale.created_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view this sale' });
    }

    res.json({ sale });
  } catch (error) {
    logger.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

module.exports = router;