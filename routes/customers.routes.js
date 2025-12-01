const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const { requireAuth } = require('../middleware/auth');

// Get all customers
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json({ customers });
  } catch (error) {
    next(error);
  }
});

// Get customer by ID
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    next(error);
  }
});

// Create customer
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { company_name, contact_person, email, mobile, location, notes } = req.body;

    if (!company_name || !contact_person || !mobile) {
      return res.status(400).json({ error: 'Company name, contact person, and mobile are required' });
    }

    const result = await customerService.createCustomer({
      company_name,
      contact_person,
      email,
      mobile,
      location,
      notes,
      created_by: req.session.user.username
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

// Update customer
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { company_name, contact_person, email, mobile, location, notes } = req.body;

    if (!company_name || !contact_person || !mobile) {
      return res.status(400).json({ error: 'Company name, contact person, and mobile are required' });
    }

    const result = await customerService.updateCustomer(req.params.id, {
      company_name,
      contact_person,
      email,
      mobile,
      location,
      notes
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Delete customer
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;