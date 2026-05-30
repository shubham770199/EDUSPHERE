export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
  department?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  badges?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  department?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}
