const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const stockMovementsService = require('../services/stockMovements.service');
const { requireAuth } = require('../middleware/auth');

// Get all products
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// Create product
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { product_id, name, description, category_id, location_id, stock, unit_price, created_at } = req.body;

    console.log('📝 Creating product with location_id:', location_id);

    if (!product_id || !name || !category_id || stock === undefined || unit_price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await productService.createProduct({
      product_id,
      name,
      description,
      category_id,
      location_id,
      stock,
      unit_price,
      created_at: created_at || new Date().toISOString()
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      success: true,
      id: result.id
    });
  } catch (error) {
    next(error);
  }
});

// Update product
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { product_id, name, description, category_id, location_id, stock, unit_price, created_at } = req.body;

    console.log('📝 Updating product:', req.params.id);
    console.log('   location_id received:', location_id);

    if (!product_id || !name || !category_id || stock === undefined || unit_price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await productService.updateProduct(req.params.id, {
      product_id,
      name,
      description,
      category_id,
      location_id,
      stock,
      unit_price,
      created_at
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Update product stock
router.put('/:id/stock', requireAuth, async (req, res, next) => {
  try {
    const { stock } = req.body;
    const productId = req.params.id;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    // Get current product to calculate difference
    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentStock = product.stock;
    const quantityDiff = stock - currentStock;

    if (quantityDiff === 0) {
      return res.json({ success: true, message: 'No change in stock' });
    }

    const type = quantityDiff > 0 ? 'in' : 'out';

    // Create stock movement (this also updates the product stock)
    await stockMovementsService.createStockMovement({
      product_id: productId,
      type: type,
      quantity: quantityDiff,
      reference: req.body.notes || 'Manual Update'
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Delete product
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;