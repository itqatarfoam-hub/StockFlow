// ============================================
// AUTHENTICATION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userService = require('../services/userService'); // or '../services/user.service'
const logger = require('../utils/logger');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', username);

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await userService.getUserByUsername(username);

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('✅ User found:', username);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('❌ Password mismatch for:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    console.log('✅ Password verified for:', username);

    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      broadcast_approval: user.broadcast_approval
    };

    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      console.log('✅ Session created for:', username);
      logger.info(`User logged in: ${username}`);

      // Return user data (without password)
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          broadcast_approval: user.broadcast_approval
        }
      });
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    logger.error('Login error', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check authentication
router.get('/me', (req, res) => {
  console.log('🔍 Auth check - Session:', req.session?.user ? 'EXISTS' : 'MISSING');

  if (req.session && req.session.user) {
    console.log('✅ User authenticated:', req.session.user.username);
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    console.log('❌ User not authenticated');
    res.status(401).json({
      authenticated: false,
      user: null
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const username = req.session?.user?.username || 'unknown';

  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      logger.error('Logout error', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    console.log('✅ User logged out:', username);
    logger.info(`User logged out: ${username}`);
    res.json({ success: true });
  });
});

module.exports = router;