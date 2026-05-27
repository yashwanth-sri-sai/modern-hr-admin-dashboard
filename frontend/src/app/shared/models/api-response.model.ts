export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalRecords: number;
  completedRecords: number;
  inProgressRecords: number;
  pendingRecords: number;
}

export interface Record {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  createdAt: string;
}
