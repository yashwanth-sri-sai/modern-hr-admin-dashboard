import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service.js';
import { ActivityService } from '../services/activity.service.js';

const activityService = new ActivityService();

const authService = new AuthService();

/**
 * POST /api/auth/login
 * Validates credentials and issues a JWT.
 */
export const loginValidation = [
  body('email').notEmpty().withMessage('User ID or Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['admin', 'user']).withMessage('Role must be admin or user'),
];

export async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/profile
 * Returns current authenticated user's profile.
 */
export async function getProfile(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Logs out the user and records the audit log.
 */
export async function logout(req, res, next) {
  try {
    if (req.user) {
      await activityService.logActivity({
        action: 'logout',
        description: `User ${req.user.name} logged out`,
        userId: req.user.id,
        username: req.user.username,
        status: 'success',
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/profile
 * Updates authenticated user's profile details.
 */
export async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
}
