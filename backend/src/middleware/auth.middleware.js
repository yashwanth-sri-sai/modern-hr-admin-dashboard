import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware: Validates Bearer JWT in Authorization header.
 * Attaches decoded user payload to req.user.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized — No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired — Please log in again'
      : 'Unauthorized — Invalid token';
    return res.status(401).json({ success: false, message });
  }
}

/**
 * Middleware: Restricts access to admin role only.
 * Must be used AFTER authenticate().
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden — Admin access required' });
  }
  next();
}
