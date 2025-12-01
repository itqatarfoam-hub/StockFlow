const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');
const { requireAuth } = require('../middleware/auth');

// Get all categories
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    next(error);
  }
});

// Create category
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await categoryService.createCategory({
      name,
      description
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ 
      ok: true,
      success: true, 
      id: result.id 
    });
  } catch (error) {
    next(error);
  }
});

// Update category
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await categoryService.updateCategory(req.params.id, {
      name,
      description
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ ok: true, success: true });
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;