// backend/server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

/* ---------------------------  CONFIG  --------------------------- */
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT || 5000);

/* ---------------------------  CORS  ----------------------------- */
// Explicit production-safe origins and development local origins.
const corsOptions = {
  origin(origin, callback) {
    // ✅ Allow requests with no origin (curl, Postman, mobile apps, some WebViews)
    if (!origin || origin === 'null') return callback(null, true);

    const normalizedOrigin = origin.toLowerCase().trim();
    const allowedProductionOrigins = [
      'https://shree-furniture-versai.vercel.app',
      'https://shree-furniture-versai-v2ee.vercel.app',
      'https://srifurniturevillage.com',
      'https://www.srifurniturevillage.com'
    ];

    const isProductionPreview = NODE_ENV === 'production' && (
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.endsWith('.railway.app')
    );

    const isDevelopmentLocal = NODE_ENV !== 'production' && (
      /^https?:\/\/localhost(:\d+)?$/i.test(normalizedOrigin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(normalizedOrigin)
    );

    if (allowedProductionOrigins.includes(normalizedOrigin) || isProductionPreview || isDevelopmentLocal) {
      return callback(null, true);
    }

    if (NODE_ENV !== 'production') {
      console.warn(`CORS (dev): allowing ${origin}`);
      return callback(null, true);
    }

    console.error(`CORS blocked: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ---------------------------  MIDDLEWARE  ----------------------- */
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

if (NODE_ENV !== 'production') app.use(morgan('dev'));

// static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'static')));

/* ---------------------------  HEALTH  -------------------------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'starting',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    time: new Date().toISOString(),
    env: NODE_ENV,
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'starting',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
  });
});

// Keep the service responsive during a cold start or database reconnect. A
// bounded 503 is safer for clients than letting Mongoose buffer requests.
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || mongoose.connection.readyState === 1) return next();

  res.set('Retry-After', '3');
  return res.status(503).json({
    message: 'The service is starting. Please retry shortly.',
    code: 'DATABASE_STARTING',
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'ShreeFurniture backend running', health: '/api/health' });
});

/* ---------------------------  ROUTES  -------------------------- */
// Keep same routes as before — ensure these files exist
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/products', require('./routes/products'));

app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api', require('./routes/publicOrders'));
app.use('/api/address', require('./routes/address'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/razorpay', require('./routes/razorpay'));
app.use('/api/cashfree', require('./routes/cashfree'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/blogs', require('./routes/blog'));

/* ----------------------  META PRODUCT FEED (CRITICAL - BEFORE SPA)  ---------- */
// ⚠️ MUST be before the SPA catch-all to prevent React from handling it
app.use('/meta-product-feed.xml', require('./routes/metafeed'));

/* ----------------------  PRODUCTION SPA SERVE  ------------------ */
/*
  Serve frontend production build ONLY when NODE_ENV === 'production'
  and do NOT override /api/* routes or /meta-product-feed.xml.
*/
const fs = require('fs'); // Ensure fs is required
if (NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get('*', (req, res, next) => {
      // skip API routes and meta feed
      if (req.path.startsWith('/api') || req.path === '/meta-product-feed.xml') return next();

      const indexFile = path.join(frontendPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        return res.sendFile(indexFile);
      } else {
        return next();
      }
    });
  } else {
    console.warn('⚠️ Frontend build folder not found at:', frontendPath);
  }
}

/* -------------------------  404 & ERRORS  --------------------- */
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err && err.message ? err.message : err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

/* ----------------------  MONGO + START SERVER  ----------------- */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in .env — aborting');
  process.exit(1);
}

// Start HTTP immediately so Railway health checks and clients never wait for
// the initial Mongo connection before receiving a response.
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (env=${NODE_ENV})`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

let reconnectDelayMs = 1000;
const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    reconnectDelayMs = 1000;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error(`MongoDB connection failed; retrying in ${reconnectDelayMs / 1000}s:`, err.message || err);
    setTimeout(connectDatabase, reconnectDelayMs);
    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30000);
  }
};

connectDatabase();

const shutdown = () => {
  console.log('SIGTERM received — shutting down gracefully');
  server.close(() => {
    mongoose.connection.close().finally(() => process.exit(0));
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
