'use strict';

// ============================================================================
// DEPENDENCIES
// ============================================================================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// ============================================================================
// APP INITIALIZATION
// ============================================================================
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS Configuration
const corsOptions = {
  origin:  process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parsers
app.use(express. json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging (Development Only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req. originalUrl}`);
    next();
  });
}

// Custom Middleware
const errorHandler = require('./middleware/errorHandler');
const requireAuth = require('./middleware/requireAuth');

// ============================================================================
// ROUTES IMPORTS
// ============================================================================

// ──────────────────────────────────────────────────────────────────────────
// Core Routes
// ──────────────────────────────────────────────────────────────────────────
const destinationRoutes = require('./routes/destinationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reviewNestedRoutes = require('./routes/reviewNestedRoutes');

// ──────────────────────────────────────────────────────────────────────────
// Authentication & User Routes
// ──────────────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const socialAuthRouter = require('./routes/socialAuth');
const userFavoritesRoutes = require('./routes/userFavoritesRoutes');

// ──────────────────────────────────────────────────────────────────────────
// Communication Routes
// ──────────────────────────────────────────────────────────────────────────
const emailRoutes = require('./routes/emailRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const contactRoutes = require('./routes/contactRoutes');

// ──────────────────────────────────────────────────────────────────────────
// Careers & Applications Routes
// ──────────────────────────────────────────────────────────────────────────
const careersRoutes = require('./routes/careersRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// ──────────────────────────────────────────────────────────────────────────
// Booking & Payment Routes
// ──────────────────────────────────────────────────────────────────────────
const bookingRoutes = require('./routes/bookingRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const cardsRoutes = require('./routes/cards');

// ──────────────────────────────────────────────────────────────────────────
// AI Features Routes
// ──────────────────────────────────────────────────────────────────────────
const itineraryRoutes = require('./routes/itinerary');
const chatbotRoutes = require('./routes/chatbot');

// ──────────────────────────────────────────────────────────────────────────
// Planner Routes
// ──────────────────────────────────────────────────────────────────────────
const plannerRoutes = require('./routes/plannerRoutes');
const shareRoutes = require('./routes/shareRoutes');

// ──────────────────────────────────────────────────────────────────────────
// Admin Routes
// ──────────────────────────────────────────────────────────────────────────
const adminUsersRoutes = require('./routes/adminUsersRoutes');
const adminReviewRoutes = require('./routes/adminReviewRoutes');
const adminAuditRoutes = require('./routes/adminAuditRoutes');
const adminBookingRoutes = require('./routes/adminBookingRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');
const adminReportsRoutes = require('./routes/adminReportsRoutes');

// ============================================================================
// API ROUTES MOUNTING
// ============================================================================

// ──────────────────────────────────────────────────────────────────────────
// Public Routes
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/destinations', destinationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', reviewNestedRoutes);

// ──────────────────────────────────────────────────────────────────────────
// Authentication Routes
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/auth', socialAuthRouter);

// ──────────────────────────────────────────────────────────────────────────
// User Routes
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/users', userFavoritesRoutes);
app.use('/api/users/cards', cardsRoutes);

// ──────────────────────────────────────────────────────────────────────────
// Communication Routes
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/email', emailRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// ──────────────────────────────────────────────────────────────────────────
// Careers Routes
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/careers', careersRoutes);
app.use('/api/careers', applicationRoutes);

// ──────────────────────────────────────────────────────────────────────────
// Booking & Payment Routes
// ──────────────────────────────────────────────────────────────────────────
app. use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentsRoutes);

// ──────────────────────────────────────────────────────────────────────────
// AI Features Routes
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ──────────────────────────────────────────────────────────────────────────
// Planner Routes
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/planner', plannerRoutes);
app.use('/', shareRoutes); // Public share links

// ──────────────────────────────────────────────────────────────────────────
// Admin Routes (Protected)
// ──────────────────────────────────────────────────────────────────────────
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/audit-logs', adminAuditRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/reports', adminReportsRoutes);

// ============================================================================
// HEALTH CHECK & DEBUG ROUTES
// ============================================================================

// Root Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WanderWise API is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env. NODE_ENV || 'development'
  });
});

// Simple Test Route
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is working perfectly!  ✅'
  });
});

// API Info Route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'WanderWise API',
    version: '1.0.0',
    description: 'Sri Lanka Travel Platform API',
    documentation: process.env.API_DOCS_URL || '/api/_routes',
    status: 'operational'
  });
});

// Debug Route:  List All Registered Routes (Development Only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/_routes', (req, res) => {
    try {
      const routes = [];
      
      // Extract routes from Express router
      const extractRoutes = (stack, basePath = '') => {
        stack.forEach((layer) => {
          if (layer.route) {
            // Direct route
            const methods = Object. keys(layer.route.methods)
              .join(', ')
              .toUpperCase();
            routes.push({
              path: basePath + layer.route.path,
              methods:  methods,
              middleware: layer.route.stack. map(s => s.name).filter(Boolean)
            });
          } else if (layer.name === 'router' && layer.handle. stack) {
            // Nested router
            const routerPath = layer.regexp
              . toString()
              .replace('/^', '')
              .replace('\\/? (? =\\/|$)/i', '')
              .replace(/\\\//g, '/');
            extractRoutes(layer.handle.stack, routerPath);
          }
        });
      };

      if (app._router && app._router.stack) {
        extractRoutes(app._router.stack);
      }

      // Sort routes alphabetically
      routes.sort((a, b) => a.path.localeCompare(b.path));

      res.status(200).json({
        success: true,
        count: routes.length,
        routes: routes,
        generatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Route listing error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to list routes',
        error: err.message
      });
    }
  });

  console.log('📋 Debug route enabled:  GET /api/_routes');
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global Error Handler (Must be after all routes)
if (errorHandler) {
  app.use(errorHandler);
}

// 404 Handler (Must be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// SERVER START
// ============================================================================

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully... `);
  
  server.close(() => {
    console.log('✅ Server closed.  Process terminating.. .');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🌴 WanderWise API Server');
  console.log('='.repeat(60));
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server running on port:  ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`📋 API Routes: http://localhost:${PORT}/api`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔍 Debug Routes: http://localhost:${PORT}/api/_routes`);
  }
  
  console.log('='.repeat(60) + '\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION!  Shutting down...');
  console.error(err. name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Export app for testing
module.exports = app;