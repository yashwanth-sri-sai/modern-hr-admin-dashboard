import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getRecords, updateRecord } from '../controllers/users.controller.js';

const router = Router();

// Retrieve records (accessible by all authenticated users)
router.get('/', authenticate, getRecords);
router.put('/:id', authenticate, updateRecord);

export default router;
