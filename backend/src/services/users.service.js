import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDb } from '../utils/db.js';
import { ActivityService } from './activity.service.js';

const activityService = new ActivityService();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class UsersService {
  /**
   * Returns all users (without passwords) with optional search.
   */
  async getAllUsers(search = '', role = '', status = '') {
    await delay(600);

    const db = await getDb();
    let users = db.data.users.map(({ password, ...u }) => u);

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }

    if (role) users = users.filter((u) => u.role === role);
    if (status) users = users.filter((u) => u.status === status);

    return users;
  }

  /**
   * Returns a single user by ID.
   */
  async getUserById(id) {
    await delay(400);

    const db = await getDb();
    const user = db.data.users.find((u) => u.id === id);

    if (!user) throw { status: 404, message: `User with ID ${id} not found` };

    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Creates a new user.
   */
  async createUser(data, requestingUser) {
    await delay(900);

    const db = await getDb();

    const exists = db.data.users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (exists) throw { status: 409, message: 'Email already in use' };

    const hashedPassword = await bcrypt.hash(data.password || 'Welcome@123', 10);

    const randomEmpId = 'EMP-' + Math.floor(1000 + Math.random() * 9000);
    const newUser = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'user',
      department: data.department || 'General',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      employeeId: randomEmpId,
      phone: data.phone || '+91 90000 ' + Math.floor(10000 + Math.random() * 90000),
      officeLocation: data.officeLocation || 'Hyderabad',
      reportingManager: data.reportingManager || 'Arjun Mehta',
      joinDate: new Date().toISOString().split('T')[0]
    };

    db.data.users.push(newUser);
    await db.write();

    if (requestingUser) {
      await activityService.logActivity({
        action: 'user_create',
        description: `${requestingUser.name} created user ${newUser.name}`,
        userId: requestingUser.id,
        username: requestingUser.username,
        status: 'success',
      });
    }

    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  /**
   * Updates an existing user.
   */
  async updateUser(id, data, requestingUser) {
    await delay(700);

    const db = await getDb();
    const index = db.data.users.findIndex((u) => u.id === id);

    if (index === -1) throw { status: 404, message: `User with ID ${id} not found` };

    const originalUser = { ...db.data.users[index] };

    // Prevent duplicate email (other than own)
    if (data.email) {
      const duplicate = db.data.users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase() && u.id !== id
      );
      if (duplicate) throw { status: 409, message: 'Email already in use by another user' };
    }

    const allowedFields = ['name', 'email', 'role', 'department', 'status'];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        db.data.users[index][field] = data[field];
      }
    });

    // Allow password update
    if (data.password) {
      db.data.users[index].password = await bcrypt.hash(data.password, 10);
    }

    await db.write();

    const updatedUser = db.data.users[index];

    if (requestingUser) {
      if (originalUser.role !== updatedUser.role) {
        await activityService.logActivity({
          action: 'user_role_update',
          description: `Role changed to ${updatedUser.role === 'admin' ? 'Admin' : 'User'} for user ${updatedUser.name} by ${requestingUser.name}`,
          userId: requestingUser.id,
          username: requestingUser.username,
          status: 'success',
        });
      } else {
        await activityService.logActivity({
          action: 'user_update',
          description: `${requestingUser.name} updated details of user ${updatedUser.name}`,
          userId: requestingUser.id,
          username: requestingUser.username,
          status: 'success',
        });
      }
    }

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  /**
   * Deletes a user by ID.
   */
  async deleteUser(id, requestingUser) {
    await delay(600);

    if (id === requestingUser.id) {
      throw { status: 400, message: 'You cannot delete your own account' };
    }

    const db = await getDb();
    const index = db.data.users.findIndex((u) => u.id === id);

    if (index === -1) throw { status: 404, message: `User with ID ${id} not found` };

    const [deletedUser] = db.data.users.splice(index, 1);
    await db.write();

    if (requestingUser) {
      await activityService.logActivity({
        action: 'user_delete',
        description: `${requestingUser.name} deleted user ${deletedUser.name}`,
        userId: requestingUser.id,
        username: requestingUser.username,
        status: 'success',
      });
    }

    return { message: `User "${deletedUser.name}" deleted successfully` };
  }

  /**
   * Returns all records with optional category/status filter.
   */
  async getRecords(category = '', status = '') {
    await delay(1000);

    const db = await getDb();
    let records = [...db.data.records];

    if (category) records = records.filter((r) => r.category === category);
    if (status) records = records.filter((r) => r.status === status);

    return records;
  }

  /**
   * Returns dashboard summary stats.
   */
  async getDashboardStats() {
    await delay(500);

    const db = await getDb();
    const users = db.data.users;
    const records = db.data.records;

    const totalUsers = 1274 - 10 + users.length; 
    const activeUsers = 214 - 8 + users.filter((u) => u.status === 'active').length; 
    const adminUsers = users.filter((u) => u.role === 'admin').length;
    
    const pendingRecords = 42 - 3 + records.filter((r) => r.status === 'pending').length; 
    const completedRecords = 3238 - 4 + records.filter((r) => r.status === 'completed').length; 
    const inProgressRecords = 202 - 3 + records.filter((r) => r.status === 'in-progress').length; 
    const totalRecords = completedRecords + pendingRecords + inProgressRecords; 

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      totalRecords,
      completedRecords,
      inProgressRecords,
      pendingRecords,
    };
  }

  /**
   * Updates a project record's fields (status, priority, assignee, etc.).
   */
  async updateRecord(id, data, requestingUser) {
    await delay(500);

    const db = await getDb();
    const index = db.data.records.findIndex((r) => r.id === id);

    if (index === -1) throw { status: 404, message: `Record with ID ${id} not found` };

    const originalRecord = { ...db.data.records[index] };

    const allowedFields = ['title', 'category', 'status', 'priority', 'assignedTo'];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        db.data.records[index][field] = data[field];
      }
    });

    await db.write();

    const updatedRecord = db.data.records[index];

    if (requestingUser) {
      let desc = `${requestingUser.name} updated record "${updatedRecord.title}"`;
      if (originalRecord.status !== updatedRecord.status) {
        desc = `${requestingUser.name} changed status of "${updatedRecord.title}" to "${updatedRecord.status}"`;
      } else if (originalRecord.priority !== updatedRecord.priority) {
        desc = `${requestingUser.name} changed priority of "${updatedRecord.title}" to "${updatedRecord.priority}"`;
      } else if (originalRecord.assignedTo !== updatedRecord.assignedTo) {
        desc = `${requestingUser.name} reassigned "${updatedRecord.title}" to ${updatedRecord.assignedTo}`;
      }

      await activityService.logActivity({
        action: 'record_update',
        description: desc,
        userId: requestingUser.id,
        username: requestingUser.username,
        status: 'success',
      });
    }

    return updatedRecord;
  }
}
