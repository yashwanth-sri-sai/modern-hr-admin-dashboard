import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './src/routes/auth.routes.js';
import usersRoutes from './src/routes/users.routes.js';
import recordsRoutes from './src/routes/records.routes.js';
import activityRoutes from './src/routes/activity.routes.js';
import { apiLimiter, loginLimiter } from './src/middleware/rate-limiter.middleware.js';
import { errorHandler, notFound } from './src/middleware/error.middleware.js';

const app = express();

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: [
    'https://modern-hr-admin-dashboard.vercel.app',
    'http://localhost:4200'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// If ALLOWED_ORIGINS env var exists, add them to the array
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(o => corsOptions.origin.push(o.trim()));
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // CRITICAL: Explicitly handle preflight requests

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', loginLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Modern HR Admin Backend Running'
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'NSQTech Dashboard API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── Versioned Routes (API v1) ───────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/records', recordsRoutes);
app.use('/api/v1/activity', activityRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
