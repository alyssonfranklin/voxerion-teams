import { Company, User, Department, Employee, AuthToken, Insight } from '@/types';
import * as crypto from 'crypto';

/**
 * Database Manager for the Voxerion Teams application.
 * In a real implementation, this would connect to a proper database.
 * For this example, we'll use in-memory storage.
 */
class DatabaseManager {
  private companies: Company[] = [];
  private users: User[] = [];
  private departments: Department[] = [];
  private employees: Employee[] = [];
  private tokens: AuthToken[] = [];
  private insights: Insight[] = [];
  
  // Cache mechanism
  private cache: Map<string, { data: any, expiry: number }> = new Map();
  
  constructor() {
    this.initializeDatabase();
  }
  
  private initializeDatabase(): void {
    // In a real implementation, this would connect to the database
    console.log('Database initialized');
  }
  
  // Helper method to generate unique IDs
  private generateId(): string {
    return crypto.randomUUID();
  }
  
  // Cache methods
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }
  
  private setInCache<T>(key: string, data: T, ttlSeconds: number = 1800): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }
  
  private removeFromCache(key: string): void {
    this.cache.delete(key);
  }
  
  // Company methods
  public async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const now = new Date().toISOString();
    const company: Company = {
      id: this.generateId(),
      ...companyData,
      createdAt: now,
      updatedAt: now
    };
    
    this.companies.push(company);
    return company;
  }
  
  public async getCompanyById(id: string): Promise<Company | null> {
    const cacheKey = `company_${id}`;
    const cached = this.getFromCache<Company>(cacheKey);
    if (cached) return cached;
    
    const company = this.companies.find(c => c.id === id) || null;
    if (company) {
      this.setInCache(cacheKey, company);
    }
    return company;
  }
  
  // User methods
  public async createUser(userData: Omit<User, 'id' | 'lastAccess'>): Promise<User> {
    const user: User = {
      id: this.generateId(),
      ...userData,
      lastAccess: new Date().toISOString()
    };
    
    this.users.push(user);
    return user;
  }
  
  public async getUserByEmail(email: string, skipCache: boolean = false): Promise<User | null> {
    const cacheKey = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    if (!skipCache) {
      const cached = this.getFromCache<User>(cacheKey);
      if (cached) return cached;
    }
    
    const user = this.users.find(u => u.email === email) || null;
    if (user && !skipCache) {
      this.setInCache(cacheKey, user);
    }
    return user;
  }
  
  public async clearUserCache(email: string): Promise<void> {
    const cacheKey = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.removeFromCache(cacheKey);
  }
  
  // Department methods
  public async createDepartment(departmentData: Department): Promise<Department> {
    this.departments.push(departmentData);
    return departmentData;
  }
  
  public async getDepartmentsByCompany(companyId: string): Promise<Department[]> {
    return this.departments.filter(d => d.companyId === companyId);
  }
  
  // Employee methods
  public async createEmployee(employeeData: Omit<Employee, 'employeeId'>): Promise<Employee> {
    const employee: Employee = {
      employeeId: this.generateId(),
      ...employeeData
    };
    
    this.employees.push(employee);
    return employee;
  }
  
  public async getEmployeesByLeader(leaderId: string): Promise<Employee[]> {
    return this.employees.filter(e => e.employeeLeader === leaderId);
  }
  
  // Token methods
  public async createToken(userId: string, expiryMinutes: number = 15): Promise<AuthToken> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
    
    const token: AuthToken = {
      token: this.generateId(),
      userId,
      expiresAt: expiresAt.toISOString()
    };
    
    this.tokens.push(token);
    return token;
  }
  
  public async validateToken(tokenStr: string): Promise<boolean> {
    const token = this.tokens.find(t => t.token === tokenStr);
    if (!token) return false;
    
    const expiry = new Date(token.expiresAt);
    return expiry > new Date();
  }
  
  // Insight methods
  public async saveInsight(insightData: Omit<Insight, 'id' | 'createdAt'>): Promise<Insight> {
    const insight: Insight = {
      id: this.generateId(),
      ...insightData,
      createdAt: new Date().toISOString()
    };
    
    this.insights.push(insight);
    return insight;
  }
  
  public async getInsightBySourceId(sourceId: string): Promise<Insight | null> {
    const cacheKey = `insight_${sourceId}`;
    const cached = this.getFromCache<Insight>(cacheKey);
    if (cached) return cached;
    
    const insight = this.insights.find(i => i.sourceId === sourceId) || null;
    if (insight) {
      this.setInCache(cacheKey, insight, 1800); // 30 minutes
    }
    return insight;
  }
}

export default DatabaseManager;