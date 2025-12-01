// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const logger = require('../utils/logger');

const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  console.log('❌ Unauthorized access attempt to:', req.path);
  res.status(401).json({ error: 'Authentication required' });
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  console.log('❌ Unauthorized admin access attempt by:', req.session?.user?.username || 'anonymous');
  res.status(403).json({ error: 'Admin access required' });
};

module.exports = {
  requireAuth,
  requireAdmin
};