import bcrypt from 'bcryptjs';
import { getDb } from '../utils/db.js';
import { signToken } from '../utils/jwt.js';
import { ActivityService } from './activity.service.js';

const activityService = new ActivityService();

/**
 * Simulates realistic API latency.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class AuthService {
  /**
   * Validates credentials and returns a JWT on success.
   * @param {string} email
   * @param {string} password
   * @param {string} role - 'admin' or 'user'
   */
  async login(usernameOrEmail, password, role) {
    await delay(800); // Simulate network/DB latency

    const db = await getDb();
    const user = db.data.users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase()) ||
        (u.username && u.username.toLowerCase() === usernameOrEmail.toLowerCase())
    );

    if (!user) {
      await activityService.logActivity({
        action: 'login_failed',
        description: `Failed login attempt for username/email: ${usernameOrEmail}`,
        status: 'failure'
      });
      throw { status: 401, message: 'Invalid credentials' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await activityService.logActivity({
        action: 'login_failed',
        description: `Failed login attempt for user: ${user.username}`,
        userId: user.id,
        username: user.username,
        status: 'failure'
      });
      throw { status: 401, message: 'Invalid credentials' };
    }

    // Validate role selection matches actual role
    if (user.role !== role) {
      await activityService.logActivity({
        action: 'login_failed',
        description: `Failed login attempt for user ${user.username}: role mismatch (requested: ${role})`,
        userId: user.id,
        username: user.username,
        status: 'failure'
      });
      throw { status: 403, message: `Access denied — your account is not registered as ${role}` };
    }

    if (user.status === 'inactive') {
      await activityService.logActivity({
        action: 'login_failed',
        description: `Failed login attempt for user ${user.username}: account is inactive`,
        userId: user.id,
        username: user.username,
        status: 'failure'
      });
      throw { status: 403, message: 'Your account has been deactivated. Contact admin.' };
    }

    // Update last login timestamp
    user.lastLogin = new Date().toISOString();
    await db.write();

    await activityService.logActivity({
      action: 'login',
      description: `User ${user.name} logged in`,
      userId: user.id,
      username: user.username,
      status: 'success'
    });

    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    });

    const { password: _, ...safeUser } = user;

    return { token, user: safeUser };
  }

  /**
   * Returns decoded user profile from JWT (no DB call needed).
   */
  async getProfile(userId) {
    await delay(300);

    const db = await getDb();
    const user = db.data.users.find((u) => u.id === userId);

    if (!user) throw { status: 404, message: 'User not found' };

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Updates an existing user's profile information.
   */
  async updateProfile(userId, data) {
    await delay(300);

    const db = await getDb();
    const user = db.data.users.find((u) => u.id === userId);

    if (!user) throw { status: 404, message: 'User not found' };

    // Update fields
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.department) user.department = data.department;
    if (data.officeLocation !== undefined) user.officeLocation = data.officeLocation;
    if (data.reportingManager !== undefined) user.reportingManager = data.reportingManager;
    if (data.employeeId !== undefined) user.employeeId = data.employeeId;
    if (data.joinDate !== undefined) user.joinDate = data.joinDate;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.preferences) {
      user.preferences = {
        ...user.preferences,
        ...data.preferences
      };
    }

    await db.write();

    // Log the profile update activity
    await activityService.logActivity({
      action: 'profile_update',
      description: `User ${user.name} updated profile details`,
      userId: user.id,
      username: user.username,
      status: 'success'
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
