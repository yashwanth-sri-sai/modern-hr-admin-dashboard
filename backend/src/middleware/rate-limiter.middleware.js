import rateLimit from 'express-rate-limit';

/**
 * Enterprise Rate Limiting Middleware.
 * 
 * DESIGN DECISION:
 * By default, this uses in-memory storage, which is suitable for single-node development.
 * For production environments with multi-instance clustering (behind a load balancer),
 * you should configure a shared store such as Redis.
 * 
 * To switch to Redis in production:
 * 1. Install packages: npm install rate-limit-redis ioredis
 * 2. Uncomment and adjust the Redis store configuration below:
 * 
 * ```javascript
 * import RedisStore from 'rate-limit-redis';
 * import Redis from 'ioredis';
 * 
 * const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
 * const store = new RedisStore({
 *   sendCommand: (...args) => redisClient.call(...args),
 * });
 * ```
 */

// General API request limiter (100 requests per 15 minutes per IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errorCode: 'TOO_MANY_REQUESTS',
    timestamp: new Date().toISOString()
  },
  // store: process.env.NODE_ENV === 'production' ? store : undefined
});

// Strict rate limiter for sensitive authentication endpoints (15 requests per 15 minutes per IP)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    errorCode: 'BRUTE_FORCE_PREVENTION',
    timestamp: new Date().toISOString()
  },
  // store: process.env.NODE_ENV === 'production' ? store : undefined
});
