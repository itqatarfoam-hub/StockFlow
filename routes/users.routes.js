// ============================================
// USER ROUTES - COMPLETE FIX
// Author: itqatarfoam-hub
// Date: 2025-11-24 08:20:00 UTC
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ========== CREATE USER ==========
router.post('/', async (req, res) => {
  console.log('➕ ========== CREATE USER START ==========');
  console.log('📅 Time:', new Date().toISOString().replace('T', ' ').substring(0, 19), 'UTC');
  console.log('📦 Request body:', { ...req.body, password: '***' });

  const { username, full_name, sales_code, email, role, password, broadcast_approval } = req.body;

  // Validation
  if (!username || !full_name || !role || !password) {
    console.error('❌ Missing required fields');
    return res.status(400).json({
      error: 'Username, full name, role, and password are required'
    });
  }

  if (password.length < 6) {
    console.error('❌ Password too short');
    return res.status(400).json({
      error: 'Password must be at least 6 characters'
    });
  }

  try {
    // Check if username already exists
    console.log('🔍 Checking if username exists:', username);

    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingUser) {
      console.error('❌ Username already exists:', username);
      return res.status(400).json({
        error: `Username "${username}" is already taken`
      });
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Generate UUID
    const userId = uuidv4();
    console.log('🆔 Generated user ID:', userId);

    // Insert user
    console.log('💾 Inserting user into database...');
    console.log('📝 User data:', {
      id: userId,
      username,
      full_name,
      sales_code: sales_code || null,
      email: email || null,
      role,
      broadcast_approval: broadcast_approval ? 1 : 0,
      password: '***'
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, username, full_name, sales_code, email, role, password, broadcast_approval, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [userId, username, full_name, sales_code || null, email || null, role, hashedPassword, broadcast_approval ? 1 : 0],
        function (err) {
          if (err) {
            console.error('❌ Database insert error:', err);
            reject(err);
          } else {
            console.log('✅ User inserted, rowid:', this.lastID);
            resolve();
          }
        }
      );
    });

    console.log('✅ User created successfully');
    console.log('➕ ========== CREATE USER COMPLETE ==========\n');

    res.status(201).json({
      success: true,
      id: userId,
      user: {
        id: userId,
        username,
        full_name,
        sales_code: sales_code || null,
        email: email || null,
        role,
        broadcast_approval: broadcast_approval ? 1 : 0
      }
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    console.error('Stack:', error.stack);

    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({
        error: `Username "${username}" is already taken`
      });
    } else {
      res.status(500).json({
        error: 'Failed to create user: ' + error.message
      });
    }
  }
});

// ========== UPDATE USER ==========
router.put('/:id', async (req, res) => {
  console.log('✏️ ========== UPDATE USER START ==========');
  console.log('📅 Time:', new Date().toISOString().replace('T', ' ').substring(0, 19), 'UTC');
  console.log('🆔 User ID:', req.params.id);
  console.log('📦 Request body:', { ...req.body, password: req.body.password ? '***' : 'not provided' });

  const { id } = req.params;
  const { username, full_name, sales_code, email, role, password, broadcast_approval } = req.body;

  // Validation
  if (!full_name || !role) {
    console.error('❌ Missing required fields');
    return res.status(400).json({
      error: 'Full name and role are required'
    });
  }

  try {
    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingUser) {
      console.error('❌ User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✓ User found:', existingUser.username);

    // Build update query
    let query = `UPDATE users SET full_name = ?, sales_code = ?, email = ?, role = ?, broadcast_approval = ?`;
    let params = [full_name, sales_code || null, email || null, role, broadcast_approval ? 1 : 0];

    // If password provided, hash and include it
    if (password && password.trim()) {
      console.log('🔒 Hashing new password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hashedPassword);
      console.log('✅ Password hashed and will be updated');
    }

    query += ` WHERE id = ?`;
    params.push(id);

    console.log('💾 Updating user...');
    console.log('📝 Update data:', {
      full_name,
      sales_code: sales_code || null,
      email: email || null,
      role,
      broadcast_approval: broadcast_approval ? 1 : 0,
      password_updated: !!password
    });

    await new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          console.error('❌ Database update error:', err);
          reject(err);
        } else {
          console.log('✅ User updated, changes:', this.changes);
          resolve();
        }
      });
    });

    console.log('✅ User updated successfully');
    console.log('✏️ ========== UPDATE USER COMPLETE ==========\n');

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to update user: ' + error.message
    });
  }
});

// ========== GET ALL USERS ==========
router.get('/', (req, res) => {
  console.log('📥 Fetching all users');

  db.all('SELECT id, username, full_name, sales_code, email, role, broadcast_approval, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    console.log('✅ Found', rows.length, 'users');
    res.json({ users: rows });
  });
});

// ========== GET USER BY ID ==========
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log('📥 Fetching user:', id);

  db.get('SELECT id, username, full_name, sales_code, email, role, broadcast_approval, created_at FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('❌ Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (!row) {
      console.error('❌ User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', row.username);
    res.json({ user: row });
  });
});

// ========== DELETE USER ==========
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log('🗑️ Deleting user:', id);

  // Prevent deleting self
  if (id === req.session.user.id) {
    console.error('❌ Cannot delete own account');
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('❌ Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (this.changes === 0) {
      console.error('❌ User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User deleted');
    res.json({ success: true });
  });
});

module.exports = router;