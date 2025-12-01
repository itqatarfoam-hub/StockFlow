const express = require('express');
const router = express.Router();
const settingsService = require('../services/settingsService');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { db } = require('../config/database');

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get login settings
router.get('/login-settings', async (req, res, next) => {
  try {
    const settings = await settingsService.getLoginSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

// GET auto-logout settings
router.get('/auto-logout', requireAuth, (req, res) => {
  db.get('SELECT auto_logout_minutes FROM settings LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, auto_logout_minutes: row?.auto_logout_minutes || 30 });
  });
});

// POST auto-logout settings
router.post('/auto-logout', requireAuth, (req, res) => {
  const { auto_logout_minutes } = req.body;

  if (!auto_logout_minutes || auto_logout_minutes < 1 || auto_logout_minutes > 1440) {
    return res.status(400).json({ error: 'Invalid timeout value' });
  }

  db.run('UPDATE settings SET auto_logout_minutes = ?', [auto_logout_minutes], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update settings' });
    }
    res.json({ success: true });
  });
});

// Update login settings
router.post('/login-settings', requireAuth, async (req, res, next) => {
  try {
    const { logo, title, subtitle, demo_label } = req.body;

    if (!logo || !title || !subtitle || !demo_label) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await settingsService.setLoginSettings({
      logo,
      title,
      subtitle,
      demo_label
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get company information
router.get('/company-info', async (req, res, next) => {
  try {
    const info = await settingsService.getCompanyInfo();
    res.json({ success: true, info });
  } catch (error) {
    next(error);
  }
});

// Update company information
router.post('/company-info', requireAuth, upload.single('logo'), async (req, res, next) => {
  try {
    const { company_name, contact_email, phone_number } = req.body;

    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await settingsService.setCompanyInfo({
      company_name,
      contact_email: contact_email || '',
      phone_number: phone_number || '',
      logo_path: logoPath
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get specific setting
router.get('/setting/:key', requireAuth, async (req, res, next) => {
  try {
    const value = await settingsService.getSetting(req.params.key);
    res.json({ value });
  } catch (error) {
    next(error);
  }
});

// Set specific setting
router.post('/setting/:key', requireAuth, async (req, res, next) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const result = await settingsService.setSetting(req.params.key, value);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ========== HEADER TITLES ==========

// Get header titles
router.get('/header-titles', async (req, res, next) => {
  try {
    db.get('SELECT * FROM header_titles WHERE id = 1', (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const titles = row || {
        dashboard_title: '📊 Dashboard',
        sales_title: '💰 Sales',
        messaging_title: '💬 Messaging',
        products_title: '📦 Item Management',
        customers_title: '👥 Customers',
        settings_title: '⚙️ Settings',
        users_title: '👤 User Management',
        crm_title: '🎯 CRM'
      };

      res.json({ success: true, titles });
    });
  } catch (error) {
    next(error);
  }
});

// Update header titles
router.post('/header-titles', requireAuth, async (req, res, next) => {
  try {
    const {
      dashboard_title,
      sales_title,
      messaging_title,
      products_title,
      customers_title,
      settings_title,
      users_title,
      crm_title
    } = req.body;

    // Check if record exists
    db.get('SELECT id FROM header_titles WHERE id = 1', (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const sql = row
        ? `UPDATE header_titles SET 
            dashboard_title = ?, 
            sales_title = ?, 
            messaging_title = ?, 
            products_title = ?, 
            customers_title = ?, 
            settings_title = ?, 
            users_title = ?,
            crm_title = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = 1`
        : `INSERT INTO header_titles (
            id, dashboard_title, sales_title, messaging_title, 
            products_title, customers_title, settings_title, users_title, crm_title
           ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run(
        sql,
        [
          dashboard_title,
          sales_title,
          messaging_title,
          products_title,
          customers_title,
          settings_title,
          users_title,
          crm_title
        ],
        (err) => {
          if (err) {
            console.error('Error updating header titles:', err);
            return res.status(500).json({ error: 'Failed to update header titles' });
          }
          res.json({ success: true });
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;