import { body, validationResult } from 'express-validator';
import { UsersService } from '../services/users.service.js';

const usersService = new UsersService();

/** GET /api/users — list with optional search/filter */
export async function getUsers(req, res, next) {
  try {
    const { search, role, status } = req.query;
    const users = await usersService.getAllUsers(search, role, status);
    res.json({ success: true, data: users, total: users.length });
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/:id */
export async function getUserById(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/** POST /api/users */
export const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
  body('department').optional().trim(),
  body('status').optional().isIn(['active', 'inactive']),
];

export async function createUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const user = await usersService.createUser(req.body, req.user);
    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/users/:id */
export const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email format is required'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
  body('department').optional().trim(),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
];

export async function updateUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const user = await usersService.updateUser(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/:id */
export async function deleteUser(req, res, next) {
  try {
    const result = await usersService.deleteUser(req.params.id, req.user);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/records — dashboard records table */
export async function getRecords(req, res, next) {
  try {
    const { category, status, delay } = req.query;
    const records = await usersService.getRecords(category, status, delay);
    res.json({ success: true, data: records, total: records.length });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/records/:id — update record details */
export async function updateRecord(req, res, next) {
  try {
    const record = await usersService.updateRecord(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'Record updated successfully', data: record });
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/stats — dashboard summary cards */
export async function getDashboardStats(req, res, next) {
  try {
    const { delay } = req.query;
    const stats = await usersService.getDashboardStats(delay);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
