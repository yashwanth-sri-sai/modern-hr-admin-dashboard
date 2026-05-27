export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  status: 'active' | 'inactive' | 'on-leave' | 'suspended' | 'pending' | 'offline';
  createdAt: string;
  lastLogin: string | null;
  employeeId?: string;
  phone?: string;
  officeLocation?: string;
  reportingManager?: string;
  joinDate?: string;
  avatar?: string;
  preferences?: {
    emailAlerts: boolean;
    activityAlerts: boolean;
  };
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  department: string;
  status: 'active' | 'inactive' | 'pending' | 'on-leave' | 'suspended' | 'offline';
}

export type UpdateUserDto = Partial<CreateUserDto>;
