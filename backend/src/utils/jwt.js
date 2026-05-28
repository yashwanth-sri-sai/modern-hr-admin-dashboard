import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET =
  process.env.JWT_SECRET ||
  'nsqtech_dashboard_super_secret_2026';

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Signs a JWT with the given payload.
 * @param {object} payload - Data to encode (id, email, role, name)
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verifies and decodes a JWT.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError} if token is invalid/expired
 */
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
