export type UserRole = 'super_admin' | 'dept_admin' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  regNo?: string;
  email?: string;
  role: UserRole;
  department?: string;
  year?: string;
  token?: string;
}

export type ComplaintStatus = 
  | 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected'
  | 'new' | 'investigating' | 'dispatched' | 'resolved' | 'rejected';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'low' | 'medium' | 'high' | 'critical';

export interface TimelineStep {
  title: string;
  status: string;
  date: string;
  description: string;
  completed: boolean;
  assignedOfficer?: string;
  department?: string;
}

export interface ComplaintAuditLog {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  action: string;
  note: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: string;
  priority?: string;
  urgency?: string;
  submittedAt: string;
  updatedAt: string;
  submittedBy: string;
  complainant?: {
    regNo?: string;
    name: string;
    email: string;
    role?: string;
    department?: string;
  };
  department: string;
  assignedOfficer?: string;
  assignedAgent?: {
    name: string;
    role: string;
    department?: string;
    phone?: string;
  } | null;
  responseRemarks?: string;
  timeline: TimelineStep[];
  attachments?: { id?: string; name: string; size: string; type: string }[];
  auditLogs?: ComplaintAuditLog[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  complaintId: string;
  type: 'status_update' | 'assignment' | 'resolution' | 'announcement';
  targetRegNo?: string;
  targetRole?: 'student' | 'super_admin' | 'dept_admin' | 'all';
}

export interface SignupRequest {
  id: string;
  regNo: string;
  fullName: string;
  email: string;
  department: string;
  year: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  rejectionReason?: string | null;
  password?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: 'super_admin' | 'dept_admin';
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface StudentUser {
  id: string;
  regNo: string;
  fullName: string;
  email: string;
  department: string;
  year: string;
  status: 'ACTIVE' | 'INACTIVE';
  activatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  action: string;
  details: string;
}

export interface SystemSettings {
  categories: string[];
  departments: string[];
  priorities: string[];
  slaHours: Record<string, number>;
}

export type ViewMode = 
  | 'home' 
  | 'dashboard' 
  | 'super_admin_dashboard' 
  | 'dept_admin_dashboard' 
  | 'student_dashboard' 
  | 'report' 
  | 'my-complaints' 
  | 'track' 
  | 'faq';


