// ============================================
// STOCKFLOW - INVENTORY MANAGEMENT SYSTEM
// Server Entry Point with File Validation
// Updated: 2025-11-23 10:48:00 UTC
// Author: itqatarfoam-hub
// ============================================

require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== FILE VALIDATION ==========
console.log('\n🔍 Validating required files...\n');

const requiredFiles = {
  config: [
    'config/database.js',
    'config/session.js'
  ],
  middleware: [
    'middleware/auth.js',
    'middleware/errorHandler.js'
  ],
  routes: [
    'routes/auth.routes.js',
    'routes/users.routes.js',
    'routes/categories.routes.js',
    'routes/locations.routes.js',
    'routes/products.routes.js',
    'routes/customers.routes.js',
    'routes/sales.routes.js',
    'routes/settings.routes.js',
    'routes/messaging.routes.js',
    'routes/roles.routes.js'
  ],
  services: [
    'services/userservice.js'
  ],
  utils: [
    'utils/logger.js'
  ],
  public: [
    'public/index.html',
    'public/style.css',
    'public/js/main.js',
    'public/js/utils.js',
    'public/js/ui.js',
    'public/js/auth.js',
    'public/js/categories.js',
    'public/js/products.js',
    'public/js/customers.js',
    'public/js/sales.js',
    'public/js/users.js',
    'public/js/settings.js',
    'public/js/messaging.js'
  ]
};

const missingFiles = [];
let totalChecked = 0;
let totalFound = 0;

// Check all files
Object.keys(requiredFiles).forEach(category => {
  console.log(`📁 Checking ${category}...`);
  requiredFiles[category].forEach(file => {
    totalChecked++;
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
      totalFound++;
    } else {
      console.log(`  ❌ ${file} - MISSING`);
      missingFiles.push(file);
    }
  });
});

console.log(`\n📊 File Check Summary: ${totalFound}/${totalChecked} files found`);

// If files are missing, show error and exit
if (missingFiles.length > 0) {
  console.error('\n❌ ERROR: Missing required files:\n');
  missingFiles.forEach(file => {
    console.error(`   - ${file}`);
  });
  console.error('\n⚠️  Please create the missing files before starting the server.\n');
  console.error('💡 Tip: Check the project documentation or contact support.\n');
  process.exit(1);
}

console.log('\n✅ All required files found! Starting server...\n');

// ========== LOAD MODULES (only after validation) ==========
const { db, initializeDatabase } = require('./config/database');
const sessionConfig = require('./config/session');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const categoryRoutes = require('./routes/categories.routes');
const locationRoutes = require('./routes/locations.routes');
const productRoutes = require('./routes/products.routes');
const customerRoutes = require('./routes/customers.routes');
const salesRoutes = require('./routes/sales.routes');
const settingsRoutes = require('./routes/settings.routes');
const messagingRoutes = require('./routes/messaging.routes');
const rolesRoutes = require('./routes/roles.routes');
const stockMovementsRoutes = require('./routes/stockMovements.routes');
const fileUploadRoutes = require('./routes/file-upload.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const crmRoutes = require('./routes/crm.routes');
const menuRoutes = require('./routes/menu.routes');
const hrmRoutes = require('./routes/hrm.routes');


// ========== SECURITY ==========
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// ========== LOGGING ==========
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ========== BODY PARSING ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== SESSION ==========
app.use(session(sessionConfig));
console.log('✅ Session middleware configured');

// ========== RATE LIMITING ==========
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Max 100 requests per minute per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please slow down.',
      retryAfter: 60
    });
  }
});

console.log('✅ Rate limiter configured (100 requests/minute)');

// ========== STATIC FILES ==========

// Static files - CSS
app.get('/style.css', (req, res) => {
  const cssPath = path.join(__dirname, 'public', 'style.css');
  if (fs.existsSync(cssPath)) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.sendFile(cssPath);
  } else {
    res.status(404).send('/* CSS not found */');
  }
});

// Static files - JS
app.get('/js/:filename(*)', (req, res) => {
  const jsPath = path.join(__dirname, 'public', 'js', req.params.filename);
  if (fs.existsSync(jsPath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(jsPath);
  } else {
    res.status(404).send('// File not found');
  }
});

// Static files fallback
app.use(express.static(path.join(__dirname, 'public')));

// ========== API ROUTES ==========

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  db.get('SELECT 1', (err) => {
    if (err) {
      return res.status(503).json({
        status: 'unhealthy',
        database: 'down',
        error: err.message
      });
    }
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api', settingsRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);
app.use('/api/files', fileUploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api', menuRoutes);
app.use('/api/hrm', hrmRoutes);


console.log('✅ API routes configured');

// ========== SPA CATCH-ALL ==========
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== ERROR HANDLING ==========
app.use(errorHandler);

// ========== START SERVER ==========
async function startServer() {
  try {
    console.log('\n🚀 Starting StockFlow server...\n');

    // Create required directories
    const dirs = ['logs', 'data', 'sessions', path.join('public', 'js', 'modules')];

    console.log('📁 Creating directories...');
    dirs.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  ✅ Created: ${dir}`);
      } else {
        console.log(`  ✓ Exists: ${dir}`);
      }
    });

    // Initialize database
    console.log('\n💾 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Start listening
    app.listen(PORT, () => {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      console.log(`\n${'='.repeat(50)}`);
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║                                                ║');
      console.log('║       ✓ StockFlow Server Ready                 ║');
      console.log('║                                                ║');
      console.log('╠════════════════════════════════════════════════╣');
      console.log('║                                                ║');
      console.log(`║  🌐 URL:      http://localhost:${PORT}            ║`);
      console.log('║  💾 Database: stockflow.db                     ║');
      console.log('║  👤 Admin:    admin / admin123                 ║');
      console.log(`║  📅 Started:  ${timestamp} UTC    ║`);
      console.log('║  👨‍💻 User:     itqatarfoam-hub                    ║');
      console.log('║                                                ║');
      console.log('╠════════════════════════════════════════════════╣');
      console.log('║                                                ║');
      console.log('║  📊 Status:   ONLINE                           ║');
      console.log('║  🔒 Security: ENABLED                          ║');
      console.log('║  🚦 Rate Limit: 100 req/min                    ║');
      console.log('║                                                ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log(`${'='.repeat(50)}\n`);

      logger.info(`Server started on port ${PORT}`);
      logger.info(`Admin credentials: admin / admin123`);
      logger.info(`Current user: itqatarfoam-hub`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error);
    console.error('\nStack trace:', error.stack);
    logger.error('Server startup failed', error);
    process.exit(1);
  }
}

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGINT', () => {
  console.log('\n\n🛑 Gracefully shutting down...');
  logger.info('Server shutting down (SIGINT)');

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
      logger.error('Database close error', err);
    } else {
      console.log('✅ Database connection closed');
      logger.info('Database closed');
    }
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 SIGTERM received, shutting down...');
  logger.info('SIGTERM received');

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });
});

// ========== UNHANDLED ERRORS ==========
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  logger.error('Unhandled Rejection', { reason: String(reason), promise: String(promise) });
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  logger.error('Uncaught Exception', { message: error.message, stack: error.stack });

  // Give time for logs to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// ========== START ==========
startServer().catch(err => {
  console.error('❌ Fatal error during startup:', err);
  process.exit(1);
});

module.exports = { app, db };
