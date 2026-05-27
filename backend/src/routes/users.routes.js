import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getUsers,
  getUserById,
  createUser,
  createUserValidation,
  updateUser,
  updateUserValidation,
  deleteUser,
  getDashboardStats,
} from '../controllers/users.controller.js';

const router = Router();

// All users routes require authentication
router.use(authenticate);

// Dashboard endpoints (accessible by all authenticated users)
router.get('/stats', getDashboardStats);

// User management (admin only)
router.get('/', requireAdmin, getUsers);
router.get('/:id', requireAdmin, getUserById);
router.post('/', requireAdmin, createUserValidation, createUser);
router.put('/:id', requireAdmin, updateUserValidation, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
