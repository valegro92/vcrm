require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const opportunitiesRoutes = require('./routes/opportunities');
const tasksRoutes = require('./routes/tasks');
const extraRoutes = require('./routes/extra');

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      scriptSrcElem: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));

// Compression
app.use(compression());

// CORS Configuration - Temporarily permissive for debugging
const corsOptions = {
  origin: true, // Allow all origins temporarily
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  message: { error: 'Too many login attempts, please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body Parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api', extraRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'vCRM API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'vCRM API',
    version: '2.0.0',
    description: 'Modern CRM System API',
    endpoints: {
      auth: '/api/auth',
      contacts: '/api/contacts',
      opportunities: '/api/opportunities',
      tasks: '/api/tasks',
      health: '/api/health'
    }
  });
});

// 404 Handler for API requests
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Serve static files from React build
const path = require('path');
const buildPath = path.join(__dirname, '../build');
const fs = require('fs');

// Check if build directory exists
if (fs.existsSync(buildPath)) {
  console.log(`✓ Serving static files from: ${buildPath}`);
  app.use(express.static(buildPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.warn(`⚠ Build directory not found at: ${buildPath}`);
  console.warn('  Static files will not be served. Run "npm run build:prod" to create the build.');

  // Fallback response when build doesn't exist
  app.get('*', (req, res) => {
    res.status(503).json({
      error: 'Application not built',
      message: 'Please run the build process first',
      buildPath: buildPath
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err);

  // Don't leak error details in production
  const errorResponse = {
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(err.status || 500).json(errorResponse);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Auto-initialize database on first run
const { createTables } = require('./database/schema');
const { getOne, runQuery, db } = require('./database/helpers');
const bcrypt = require('bcryptjs');

const initializeDatabaseIfNeeded = async () => {
  try {
    let tableExists = false;

    if (db.type === 'postgres') {
      const result = await getOne("SELECT to_regclass('public.users') as exists");
      tableExists = !!result?.exists;
    } else {
      const result = await getOne("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      tableExists = !!result;
    }

    if (!tableExists) {
      console.log('Database not initialized. Creating tables...');
      await createTables();

      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);

      try {
        if (db.type === 'postgres') {
          await runQuery(`
            INSERT INTO users (username, email, password, "fullName", avatar, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (username) DO NOTHING
          `, ['admin', 'admin@vcrm.it', hashedPassword, 'Amministratore', 'AD', 'admin']);
        } else {
          await runQuery(`
            INSERT OR IGNORE INTO users (username, email, password, fullName, avatar, role)
            VALUES (?, ?, ?, ?, ?, ?)
          `, ['admin', 'admin@vcrm.it', hashedPassword, 'Amministratore', 'AD', 'admin']);
        }

        console.log('✓ Database initialized successfully');
        console.log('  Default credentials: admin / admin123');
      } catch (err) {
        console.error('Error creating default user:', err);
      }
    } else {
      console.log('✓ Database already initialized');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Start Server
initializeDatabaseIfNeeded().then(() => {
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  vCRM Server v2.0.0`);
    console.log(`  Environment: ${NODE_ENV}`);
    console.log(`  Server running on http://localhost:${PORT}`);
    console.log(`  API docs: http://localhost:${PORT}/api`);
    console.log('═══════════════════════════════════════════════════════');
  });
});

module.exports = app;
