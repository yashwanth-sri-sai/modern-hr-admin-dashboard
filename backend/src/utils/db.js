import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../data/db.json');

const defaultData = {
  users: [
    {
      id: '1',
      name: 'Arjun Mehta',
      username: 'admin',
      email: 'arjun.mehta@nsqtech.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      department: 'Security',
      status: 'active',
      createdAt: '2024-01-15T08:00:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-1001',
      phone: '+91 98450 12345',
      officeLocation: 'Hyderabad',
      reportingManager: 'Executive Board',
      joinDate: '2024-01-15',
      preferences: {
        emailAlerts: false,
        activityAlerts: false
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      username: 'yash',
      email: 'sarah.johnson@nsqtech.com',
      password: bcrypt.hashSync('yash123', 10),
      role: 'user',
      department: 'Human Resources',
      status: 'active',
      createdAt: '2024-02-10T09:30:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-2187',
      phone: '+44 20 7946 0958',
      officeLocation: 'London',
      reportingManager: 'Arjun Mehta',
      joinDate: '2024-02-10',
      preferences: {
        emailAlerts: false,
        activityAlerts: false
      }
    },
    {
      id: '3',
      name: 'Rahul Verma',
      username: 'rahul',
      email: 'rahul.verma@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'user',
      department: 'Engineering',
      status: 'active',
      createdAt: '2024-02-18T10:00:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-1042',
      phone: '+91 98765 43210',
      officeLocation: 'Bengaluru',
      reportingManager: 'Arjun Mehta',
      joinDate: '2024-02-18'
    },
    {
      id: '4',
      name: 'Ananya Singh',
      username: 'ananya',
      email: 'ananya.singh@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'user',
      department: 'Operations',
      status: 'pending',
      createdAt: '2024-03-05T11:00:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-1089',
      phone: '+91 91234 56789',
      officeLocation: 'Mumbai',
      reportingManager: 'Sarah Johnson',
      joinDate: '2024-03-05'
    },
    {
      id: '5',
      name: 'Karan Mehta',
      username: 'karan',
      email: 'karan.mehta@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'admin',
      department: 'IT Support',
      status: 'active',
      createdAt: '2024-03-20T09:00:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-1002',
      phone: '+91 88888 77777',
      officeLocation: 'Pune',
      reportingManager: 'Arjun Mehta',
      joinDate: '2024-03-20'
    },
    {
      id: '6',
      name: 'Priya Nair',
      username: 'priya',
      email: 'priya.nair@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'user',
      department: 'Compliance',
      status: 'on-leave',
      createdAt: '2024-04-01T08:45:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-3045',
      phone: '+65 6789 0123',
      officeLocation: 'Singapore',
      reportingManager: 'Arjun Mehta',
      joinDate: '2024-04-01'
    },
    {
      id: '7',
      name: 'Michael Chen',
      username: 'michael',
      email: 'michael.chen@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'user',
      department: 'Finance',
      status: 'active',
      createdAt: '2024-04-12T10:30:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-4091',
      phone: '+65 9123 4567',
      officeLocation: 'Singapore',
      reportingManager: 'Sarah Johnson',
      joinDate: '2024-04-12'
    },
    {
      id: '8',
      name: 'Daniel Brooks',
      username: 'daniel',
      email: 'daniel.brooks@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'user',
      department: 'Customer Success',
      status: 'suspended',
      createdAt: '2024-04-22T09:15:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-5082',
      phone: '+44 1632 960012',
      officeLocation: 'London',
      reportingManager: 'Sarah Johnson',
      joinDate: '2024-04-22'
    },
    {
      id: '9',
      name: 'Emma Rodriguez',
      username: 'emma',
      email: 'emma.rodriguez@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'user',
      department: 'Product',
      status: 'active',
      createdAt: '2024-05-03T11:00:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-6023',
      phone: '+44 1632 960085',
      officeLocation: 'London',
      reportingManager: 'Arjun Mehta',
      joinDate: '2024-05-03'
    },
    {
      id: '10',
      name: 'Sophia Kim',
      username: 'sophia',
      email: 'sophia.kim@nsqtech.com',
      password: bcrypt.hashSync('User@123', 10),
      role: 'user',
      department: 'Security',
      status: 'offline',
      createdAt: '2024-05-14T08:30:00.000Z',
      lastLogin: null,
      employeeId: 'EMP-1104',
      phone: '+65 8234 5678',
      officeLocation: 'Singapore',
      reportingManager: 'Arjun Mehta',
      joinDate: '2024-05-14'
    }
  ],
  records: [
    { id: 'r1', title: 'Employment Verification — Sarah Johnson', category: 'Compliance', status: 'completed', priority: 'high', assignedTo: 'Priya Nair', createdAt: '2026-05-20T10:00:00.000Z' },
    { id: 'r2', title: 'Onboarding Checklist — Michael Chen', category: 'Human Resources', status: 'in-progress', priority: 'critical', assignedTo: 'Sarah Johnson', createdAt: '2026-05-22T09:00:00.000Z' },
    { id: 'r3', title: 'Identity Document Audit — EMP-1042', category: 'Compliance', status: 'in-progress', priority: 'high', assignedTo: 'Priya Nair', createdAt: '2026-05-24T11:00:00.000Z' },
    { id: 'r4', title: 'ISO 27001 Security Clearance', category: 'Security', status: 'pending', priority: 'critical', assignedTo: 'Sophia Kim', createdAt: '2026-05-25T08:00:00.000Z' },
    { id: 'r5', title: 'Background Screening — Daniel Brooks', category: 'Compliance', status: 'completed', priority: 'medium', assignedTo: 'Priya Nair', createdAt: '2026-05-18T10:00:00.000Z' },
    { id: 'r6', title: 'Academic Credential Check — EMP-2187', category: 'Operations', status: 'completed', priority: 'high', assignedTo: 'Rahul Verma', createdAt: '2026-05-19T09:30:00.000Z' },
    { id: 'r7', title: 'Right to Work Verification — Emma Rodriguez', category: 'Compliance', status: 'pending', priority: 'medium', assignedTo: 'Priya Nair', createdAt: '2026-05-26T08:00:00.000Z' },
    { id: 'r8', title: 'Compliance Report Export — Q2 2026', category: 'Finance', status: 'in-progress', priority: 'high', assignedTo: 'Michael Chen', createdAt: '2026-05-27T05:00:00.000Z' },
    { id: 'r9', title: 'IT Access Provisioning — Hyderabad Batch', category: 'IT Support', status: 'pending', priority: 'medium', assignedTo: 'Karan Mehta', createdAt: '2026-05-27T06:30:00.000Z' },
    { id: 'r10', title: 'Reference Check Audit — Priya Nair', category: 'Human Resources', status: 'completed', priority: 'low', assignedTo: 'Sarah Johnson', createdAt: '2026-05-15T09:00:00.000Z' }
  ],
  activities: []
};

let db;

export async function getDb() {
  if (!db) {
    const adapter = new JSONFile(dbFile);
    db = new Low(adapter, defaultData);
    await db.read();

    // Seed if empty
    if (!db.data || !db.data.users || db.data.users.length === 0) {
      const now = new Date();
      defaultData.activities = [
        {
          id: 'act1',
          action: 'record_update',
          description: 'Sarah Johnson updated compliance records',
          userId: '2',
          username: 'yash',
          status: 'success',
          timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString()
        },
        {
          id: 'act2',
          action: 'record_update',
          description: 'Rahul Verma approved employee verification for EMP-1042',
          userId: '3',
          username: 'rahul',
          status: 'success',
          timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'act3',
          action: 'record_update',
          description: 'Michael Chen exported compliance audit report',
          userId: '7',
          username: 'michael',
          status: 'success',
          timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
        },
        {
          id: 'act4',
          action: 'user_role_update',
          description: 'Priya Nair modified user permissions for Sophia Kim',
          userId: '6',
          username: 'priya',
          status: 'success',
          timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'act5',
          action: 'login',
          description: 'Emma Rodriguez logged in from Hyderabad Office',
          userId: '9',
          username: 'emma',
          status: 'success',
          timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'act6',
          action: 'record_update',
          description: 'Daniel Brooks resolved verification issue for Arjun Mehta',
          userId: '8',
          username: 'daniel',
          status: 'success',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      db.data = defaultData;
      await db.write();
    }
  }
  return db;
}
