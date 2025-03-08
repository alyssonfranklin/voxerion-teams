// Company types
export interface Company {
  id: string;
  name: string;
  assistantId: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  systemRole: 'admin' | 'user';
  lastAccess: string;
  department?: string;
  companyRole?: string;
}

// Department types
export interface Department {
  companyId: string;
  departmentName: string;
  departmentDesc?: string;
  userHead?: string;
}

// Employee types
export interface Employee {
  employeeId: string;
  employeeName: string;
  employeeRole: 'manager' | 'team_lead' | 'employee';
  employeeLeader?: string;
}

// Calendar event types
export interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  organizer: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  attendees: Attendee[];
  location?: {
    displayName?: string;
  };
  bodyPreview?: string;
}

export interface Attendee {
  type: string;
  status: {
    response: string;
    time: string;
  };
  emailAddress: {
    name: string;
    address: string;
  };
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  from: {
    user?: {
      id: string;
      displayName: string;
      email?: string;
    };
  };
  createdDateTime: string;
}

// Insight types
export interface Insight {
  id: string;
  content: string;
  type: 'calendar' | 'chat';
  sourceId: string; // EventId or ChatId
  createdAt: string;
}

// Authentication types
export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: string;
}

// User access details
export interface UserAccessDetails {
  userId: string;
  companyId: string;
  assistantId: string;
  role: string;
  status: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}