export type GrievanceCategory =
  | 'Hostel & Facilities'
  | 'IT & Network'
  | 'Finance & Scholarship'
  | 'Academics'
  | 'Harassment & Discipline'
  | 'Sanitation & Hygiene';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'new' | 'investigating' | 'dispatched' | 'resolved';

export type SlaStatus = 'normal' | 'warning' | 'breached';

export interface AuditLog {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  action: string;
  note?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Ticket {
  id: string;
  title: string;
  category: GrievanceCategory;
  department: string;
  urgency: UrgencyLevel;
  status: TicketStatus;
  slaStatus: SlaStatus;
  location: string;
  description: string;
  complainant: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
  eta: string;
  etaMinutesLeft: number;
  assignedAgent?: {
    name: string;
    role: string;
    phone?: string;
  };
  attachments: Attachment[];
  auditLogs: AuditLog[];
  currentStepIndex: number; // 0: Logged, 1: Assigned, 2: Dispatched, 3: Resolved
}

export interface DepartmentPerformance {
  department: string;
  onTimeRate: number;
  resolvedCount: number;
  avgHours: number;
  color: string;
}

export type ViewType = 'landing' | 'citizen' | 'admin' | 'faq';
