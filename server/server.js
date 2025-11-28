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
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false
}));

// Compression
app.use(compression());

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = NODE_ENV === 'production'
      ? [
          'https://v-crm-sigma.vercel.app',
          ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
        ]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

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

// Start Server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  vCRM Server v2.0.0`);
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  API docs: http://localhost:${PORT}/api`);
  console.log('═══════════════════════════════════════════════════════');
});

module.exports = app;
