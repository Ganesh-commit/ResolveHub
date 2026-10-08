export type UserRole = 'super_admin' | 'dept_admin' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  regNo?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  year?: string;
  token?: string;
  avatarUrl?: string;
  mustChangePassword?: boolean;
}

export type ComplaintStatus = 
  | 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected'
  | 'new' | 'investigating' | 'dispatched' | 'resolved' | 'rejected';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'low' | 'medium' | 'high' | 'critical';

export type EscalationLevel = 'LEVEL_0_STAFF' | 'LEVEL_1_HOD' | 'LEVEL_2_DEAN';

export interface TimelineStep {
  stepKey?: 'submitted' | 'assigned' | 'in_progress' | 'resolved' | string;
  title: string;
  timestamp?: string | Date | null;
  status?: string;
  date?: string;
  description?: string;
  note?: string;
  completed: boolean;
  assignedOfficer?: string;
  department?: string;
  actor?: {
    name: string;
    role: string;
  };
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
  
  // ── Anonymous Mode & Campus Heatmap ──
  isAnonymous?: boolean;
  locationId?: string;
  zone?: string;
  hostelBlock?: string;
  rating?: number;
  ratingFeedback?: string;
  isReopened?: boolean;
  reopenReason?: string;

  // ── SLA Escalation Fields ──
  slaDeadline?: string;
  slaStatus?: string;
  escalationLevel?: EscalationLevel;
  isEscalated?: boolean;
  escalatedAt?: string;
  escalationReason?: string;

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
  phone?: string;
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
  | 'landing'
  | 'about'
  | 'dashboard' 
  | 'super_admin_dashboard' 
  | 'super_admin_complaints'
  | 'super_admin_departments'
  | 'super_admin_students'
  | 'super_admin_requests'
  | 'super_admin_admins'
  | 'super_admin_roles'
  | 'super_admin_analytics'
  | 'super_admin_notifications'
  | 'super_admin_audit'
  | 'super_admin_settings'
  | 'dept_admin_dashboard' 
  | 'dept_admin_inbox'
  | 'dept_admin_complaints'
  | 'dept_admin_team'
  | 'dept_admin_assigned'
  | 'dept_admin_students'
  | 'dept_admin_analytics'
  | 'dept_admin_kb'
  | 'dept_admin_notifications'
  | 'dept_admin_settings'
  | 'student_dashboard' 
  | 'report' 
  | 'my-complaints' 
  | 'track' 
  | 'notifications'
  | 'faq'
  | 'settings'
  | 'profile'
  | 'login';


