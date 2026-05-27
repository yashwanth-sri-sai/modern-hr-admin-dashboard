export interface LoginRequest {
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  status: 'active' | 'inactive' | 'pending' | 'on-leave' | 'suspended' | 'offline';
  createdAt: string;
  lastLogin: string | null;
  phone?: string;
  avatar?: string;
  employeeId?: string;
  officeLocation?: string;
  reportingManager?: string;
  joinDate?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    emailAlerts?: boolean;
    activityAlerts?: boolean;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  department: string;
  iat: number;
  exp: number;
}
