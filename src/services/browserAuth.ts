import { User, UserRole, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';
import { simpleHash } from '@/utils/hash';

// Mock database - In production, this would be replaced with actual API calls
const USERS_KEY = 'edu_sphere_users';

// Simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

// Browser-compatible authentication service
class BrowserAuthService {
  private getUsers(): (User & { password: string })[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: (User & { password: string })[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private generateToken(user: User): string {
    // Create a simple token with user data and expiration
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
    
    // Base64 encode the payload (in production, use proper JWT library on backend)
    return btoa(JSON.stringify(payload));
  }

  public verifyToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token));
      
      // Check if token is expired
      if (Date.now() > payload.exp) {
        throw new Error('Token expired');
      }
      
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await simulateApiDelay();
    
    const users = this.getUsers();
    const user = users.find(u => 
      u.email === credentials.email && 
      u.role === credentials.role
    );

    if (!user) {
      throw new Error('User not found or invalid role');
    }

    // Simple password verification
    const hashedInput = simpleHash(credentials.password);
    if (hashedInput !== user.password) {
      throw new Error('Invalid password');
    }

    const token = this.generateToken(user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    };
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    await simulateApiDelay();
    
    const users = this.getUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => 
      u.email === data.email && u.role === data.role
    );
    
    if (existingUser) {
      throw new Error('User already exists with this email and role');
    }

    // Hash password using simple hash
    const hashedPassword = simpleHash(data.password);
    
    // Create new user
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    const token = this.generateToken(newUser);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      user: userWithoutPassword,
      token,
      message: 'Registration successful'
    };
  }

  public async getUserFromToken(token: string): Promise<User> {
    await simulateApiDelay();
    
    const decoded = this.verifyToken(token);
    const users = this.getUsers();
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Initialize empty user database
  public initializeUserDatabase(): void {
    const existingUsers = this.getUsers();
    if (existingUsers.length === 0) {
      // Start with empty user database
      this.saveUsers([]);
    }
  }
}

export const browserAuthService = new BrowserAuthService();