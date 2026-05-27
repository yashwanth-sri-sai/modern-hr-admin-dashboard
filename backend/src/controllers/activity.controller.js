import { ActivityService } from '../services/activity.service.js';

const activityService = new ActivityService();

/**
 * GET /api/v1/activity
 * Fetches all audit logs (accessible by authenticated users)
 */
export async function getActivities(req, res, next) {
  try {
    const activities = await activityService.getActivities();
    res.json({
      success: true,
      data: activities,
      total: activities.length,
    });
  } catch (err) {
    next(err);
  }
}
