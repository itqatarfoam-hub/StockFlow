// ============================================
// SESSION CONFIGURATION
// Handles user authentication sessions
// Updated: 2025-11-24 07:45:17 UTC
// Author: itqatarfoam-hub
// ============================================

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const sessionConfig = {
  // Session store - persist sessions across server restarts
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './data',
    table: 'sessions',
    ttl: 86400000 // 24 hours in milliseconds
  }),
  
  // Session secret (change this in production!)
  secret: process.env.SESSION_SECRET || 'stockflow-secret-key-change-in-production-2025',
  
  // Session cookie name
  name: 'stockflow.sid',
  
  // CRITICAL: Don't save session until something stored
  resave: false,
  
  // CRITICAL: Don't create session for every request
  saveUninitialized: false,
  
  // Cookie configuration
  cookie: {
    secure: false,              // Set to true if using HTTPS
    httpOnly: true,             // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',            // CSRF protection
    path: '/'                   // Cookie available for all paths
  },
  
  // Reset cookie expiration on every request
  rolling: true,
  
  // Generate new session ID on login (security)
  genid: () => {
    return require('crypto').randomBytes(16).toString('hex');
  }
};

console.log('✅ Session config loaded with SQLite store');

module.exports = sessionConfig;