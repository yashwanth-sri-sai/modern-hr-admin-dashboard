import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getActivities } from '../controllers/activity.controller.js';

const router = Router();

// Retrieve activity logs (all authenticated users can read the timeline)
router.get('/', authenticate, getActivities);

export default router;
