export interface ActivityLog {
  id: string;
  action: 'login' | 'logout' | 'user_create' | 'user_delete' | 'user_role_update' | 'user_update' | 'login_failed' | 'record_update';
  description: string;
  userId: string | null;
  username: string | null;
  ipAddress: string | null;
  status: 'success' | 'failure';
  timestamp: string;
}
