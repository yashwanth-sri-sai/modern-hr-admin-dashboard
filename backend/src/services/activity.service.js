import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/db.js';

export class ActivityService {
  /**
   * Log an activity to db.json
   * @param {Object} data
   * @param {string} data.action - login, logout, user_create, user_delete, user_role_update, login_failed, record_update
   * @param {string} data.description - Description message
   * @param {string} [data.userId] - User ID who triggered the action
   * @param {string} [data.username] - Username of the user
   * @param {string} [data.ipAddress] - IP Address
   * @param {string} [data.status] - 'success' or 'failure'
   */
  async logActivity(data) {
    try {
      const db = await getDb();
      if (!db.data.activities) {
        db.data.activities = [];
      }

      const activity = {
        id: uuidv4(),
        action: data.action,
        description: data.description,
        userId: data.userId || null,
        username: data.username || null,
        ipAddress: data.ipAddress || null,
        status: data.status || 'success',
        timestamp: new Date().toISOString(),
      };

      db.data.activities.push(activity);
      await db.write();
      return activity;
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }
  }

  /**
   * Retrieve all activities, sorted from newest to oldest.
   * @returns {Promise<Array>}
   */
  async getActivities() {
    const db = await getDb();
    const list = db.data.activities || [];
    // Return sorted by newest first
    return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}
