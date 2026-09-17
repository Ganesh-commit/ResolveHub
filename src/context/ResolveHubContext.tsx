import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Complaint,
  NotificationItem,
  ViewMode,
  SignupRequest,
  AuthUser,
  UserRole,
  AdminUser,
  StudentUser,
  ActivityLog,
  SystemSettings
} from '../types';
import { isValidRegistrationNumber } from '../data/validRegistrationNumbers';
import { authApi, ticketApi } from '../services/api';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface PushBannerNotification {
  id: string;
  email: string;
  code: string;
  title: string;
  message: string;
}

interface ResolveHubContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  authUser: AuthUser | null;
  userLoggedIn: boolean;
  userRole: UserRole;
  loginUser: (identifier: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;
  
  // Legacy / Student Auth Wrappers
  currentUserRegNo: string | null;
  loginWithRegNo: (regNo: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  // Complaints & Activity
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  submitComplaint: (data: {
    category: string;
    department?: string;
    description: string;
    location?: string;
    attachments?: { name: string; size: string; type: string }[];
    email?: string;
  }) => string | null;
  updateComplaintStatus: (id: string, status: string, responseRemarks?: string) => Promise<void>;
  assignComplaint: (id: string, agentName: string, role?: string, department?: string) => Promise<void>;
  addAuditRemarks: (id: string, note: string) => Promise<void>;
  fetchComplaints: () => Promise<void>;

  // Signup Requests Verification
  signupRequests: SignupRequest[];
  submitSignupRequest: (data: {
    regNo: string;
    fullName: string;
    email: string;
    department: string;
    year: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;
  approveSignupRequest: (requestId: string) => Promise<void>;
  rejectSignupRequest: (requestId: string, reason?: string) => Promise<void>;
  checkSignupStatus: (regNo: string) => { status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_FOUND'; reason?: string };

  // Admin Management (Super Admin)
  adminsList: AdminUser[];
  fetchAdmins: () => Promise<void>;
  createDeptAdmin: (data: { name: string; username: string; password: string; department: string }) => Promise<{ success: boolean; message?: string }>;
  toggleAdminStatus: (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => Promise<void>;
  deleteAdminAccount: (id: string) => Promise<void>;

  // Student Management (Super Admin)
  studentsList: StudentUser[];
  fetchStudents: () => Promise<void>;
  toggleStudentStatus: (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => Promise<void>;

  // System Settings & Activity Audit Logs
  systemSettings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  activityLogs: ActivityLog[];
  fetchActivityLogs: () => Promise<void>;

  // UI Utilities
  notifications: NotificationItem[];
  unreadCount: number;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  trackQuery: string;
  setTrackQuery: (id: string) => void;
  clearDatabase: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  pushBanner: PushBannerNotification | null;
  dismissPushBanner: () => void;
}

const ResolveHubContext = createContext<ResolveHubContextType | undefined>(undefined);

const LOCAL_STORAGE_AUTH_KEY = 'resolvehub_auth_session_2026';
const LOCAL_STORAGE_COMPLAINTS_KEY = 'resolvehub_campus_complaints_db';
const LOCAL_STORAGE_NOTIFS_KEY = 'resolvehub_campus_notifs_db';
const LOCAL_STORAGE_SIGNUP_REQ_KEY = 'resolvehub_campus_signup_requests_db';

const DEFAULT_SETTINGS: SystemSettings = {
  categories: ['Hostel & Facilities', 'IT & Network', 'Finance & Scholarship', 'Sanitation & Hygiene', 'Academics', 'Harassment & Discipline'],
  departments: ['Facilities & HVAC', 'IT & Network Systems', 'Student Finance Bureau', 'Health & Sanitation', 'Academics Redressal', 'Internal Grievance Committee'],
  priorities: ['Low', 'Medium', 'High', 'Urgent'],
  slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
};

export const ResolveHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewMode>('home');

  // Authenticated Session State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const userLoggedIn = !!authUser;
  const userRole: UserRole = authUser?.role || 'student';
  const currentUserRegNo = authUser?.regNo || (authUser?.role === 'student' ? authUser.username || null : null);

  // Persistence for Auth Session
  useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(authUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth user to localStorage', e);
    }
  }, [authUser]);

  // Sync View to Role on Load/Auth Change (For Admins only, students stay on home view)
  useEffect(() => {
    if (authUser) {
      if (authUser.role === 'super_admin' && activeView === 'home') {
        setActiveView('super_admin_dashboard');
      } else if (authUser.role === 'dept_admin' && activeView === 'home') {
        setActiveView('dept_admin_dashboard');
      }
    }
  }, [authUser]);

  // Complaints State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COMPLAINTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Signup Requests State
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SIGNUP_REQ_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin List, Student List, Activity Logs & System Settings State
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [studentsList, setStudentsList] = useState<StudentUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  const [trackQuery, setTrackQuery] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pushBanner, setPushBanner] = useState<PushBannerNotification | null>(null);

  // Fetch Complaints from Backend API
  const fetchComplaints = async () => {
    try {
      const params: any = {};
      if (authUser?.role === 'dept_admin' && authUser.department) {
        params.role = 'dept_admin';
        params.department = authUser.department;
      } else if (authUser?.role === 'student' && authUser.regNo) {
        params.role = 'student';
        params.regNo = authUser.regNo;
      }
      const data = await ticketApi.getAll(params);
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch (e) {
      // Offline fallback
    }
  };

  // Fetch Signup Requests
  const fetchSignupRequests = async () => {
    try {
      const data = await authApi.getSignupRequests();
      if (Array.isArray(data)) setSignupRequests(data);
    } catch (e) {}
  };

  // Fetch Admins List
  const fetchAdmins = async () => {
    try {
      const data = await authApi.getAdmins();
      if (Array.isArray(data)) setAdminsList(data);
    } catch (e) {}
  };

  // Fetch Students List
  const fetchStudents = async () => {
    try {
      const data = await authApi.getStudents();
      if (Array.isArray(data)) setStudentsList(data);
    } catch (e) {}
  };

  // Fetch Activity Audit Logs
  const fetchActivityLogs = async () => {
    try {
      const data = await authApi.getActivityLogs();
      if (Array.isArray(data)) setActivityLogs(data);
    } catch (e) {}
  };

  // Fetch System Settings
  const fetchSettings = async () => {
    try {
      const data = await authApi.getSettings();
      if (data && data.categories) setSystemSettings(data);
    } catch (e) {}
  };

  // Load initial backend data on mount / role changes
  useEffect(() => {
    fetchComplaints();
    fetchSignupRequests();
    fetchSettings();
    if (authUser?.role === 'super_admin') {
      fetchAdmins();
      fetchStudents();
      fetchActivityLogs();
    }
  }, [authUser]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_COMPLAINTS_KEY, JSON.stringify(complaints));
    } catch (e) {}
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SIGNUP_REQ_KEY, JSON.stringify(signupRequests));
    } catch (e) {}
  }, [signupRequests]);

  const playNotificationChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playNote(659.25, now, 0.15);
      playNote(880.00, now + 0.12, 0.35);
    } catch (e) {}
  };

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'Notifications Updated', 'All campus notifications marked as read.');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissPushBanner = () => {
    setPushBanner(null);
  };

  // ── AUTHENTICATION METHODS ────────────────────────────────────────────────
  const loginUser = async (identifier: string, password: string, role?: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      const data = await authApi.login(identifier, password, role);
      if (data && data.role) {
        const authData: AuthUser = {
          id: data.id,
          name: data.name,
          username: data.username || identifier,
          regNo: data.regNo || (data.role === 'student' ? identifier.toUpperCase() : undefined),
          email: data.email,
          role: data.role as UserRole,
          department: data.department,
          token: data.token
        };

        setAuthUser(authData);
        setIsLoginModalOpen(false);

        if (authData.role === 'super_admin') {
          setActiveView('super_admin_dashboard');
          addToast('success', 'Super Admin Login', `Welcome System Super Admin ${authData.name}`);
        } else if (authData.role === 'dept_admin') {
          setActiveView('dept_admin_dashboard');
          addToast('success', 'Department Admin Login', `Welcome ${authData.name} (${authData.department})`);
        } else {
          setActiveView('student_dashboard');
          addToast('success', 'Student Sign In', `Welcome ${authData.name} (Reg No: ${authData.regNo})`);
        }

        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Authentication failed. Please check your credentials.' };
    }

    return { success: false, message: 'Authentication failed.' };
  };

  const logoutUser = () => {
    setAuthUser(null);
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    setActiveView('home');
    addToast('info', 'Signed Out', 'You have been signed out.');
  };

  // Legacy student login wrapper
  const loginWithRegNo = async (regNo: string, password: string) => {
    return loginUser(regNo, password, 'student');
  };

  const logout = () => {
    logoutUser();
  };

  // ── COMPLAINT ACTIONS ─────────────────────────────────────────────────────
  const submitComplaint = (data: {
    category: string;
    department?: string;
    description: string;
    location?: string;
    attachments?: { name: string; size: string; type: string }[];
    email?: string;
  }): string | null => {
    if (!authUser) {
      setIsLoginModalOpen(true);
      addToast('warning', 'Login Required!', 'You must log in before submitting a complaint.');
      return null;
    }

    const regNo = authUser.regNo || authUser.username || '241FA07001';
    const studentName = authUser.name || `Student ${regNo}`;
    const studentEmail = data.email || authUser.email || `${regNo.toLowerCase()}@campus.edu`;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `RP-${randomNum}`;
    const nowStr = new Date().toLocaleString('en-IN');

    const titleExtract = data.description.length > 55
      ? data.description.substring(0, 52) + '...'
      : data.description || 'Campus Student Grievance';

    let dept = data.department || 'Campus Administration';
    if (!data.department) {
      if (data.category.includes('Hostel')) dept = 'Facilities & HVAC';
      else if (data.category.includes('Exam') || data.category.includes('Academic')) dept = 'Academics Redressal';
      else if (data.category.includes('Wi-Fi') || data.category.includes('IT')) dept = 'IT & Network Systems';
      else if (data.category.includes('Sanitation') || data.category.includes('Food')) dept = 'Health & Sanitation';
      else if (data.category.includes('Finance')) dept = 'Student Finance Bureau';
    }

    const newComplaint: Complaint = {
      id: newId,
      title: titleExtract,
      category: data.category,
      description: data.description,
      location: data.location || 'Main Campus',
      status: 'new',
      priority: data.category.includes('Anti-Ragging') ? 'Urgent' : 'Medium',
      urgency: data.category.includes('Anti-Ragging') ? 'critical' : 'medium',
      submittedAt: nowStr,
      updatedAt: nowStr,
      submittedBy: `Reg No: ${regNo} (${studentEmail})`,
      complainant: {
        regNo: regNo,
        name: studentName,
        email: studentEmail,
        role: 'Student',
        department: authUser.department || 'Engineering'
      },
      department: dept,
      assignedOfficer: 'Automated Desk Triage',
      responseRemarks: '',
      attachments: data.attachments || [],
      timeline: [
        { title: 'Grievance Submitted', status: 'Submitted', date: nowStr, description: `Logged by ${studentName} (${regNo}).`, completed: true },
        { title: 'Department Review & Triage', status: 'Under Review', date: 'Pending Triage', description: `Assigned to ${dept}.`, completed: false },
        { title: 'Action & Field Dispatch', status: 'In Progress', date: 'Scheduled', description: 'Technician dispatched for field resolution.', completed: false },
        { title: 'Resolution & Signoff', status: 'Resolved', date: 'Target < 24 hrs', description: 'Final inspection & student confirmation.', completed: false }
      ],
      auditLogs: [
        { id: Math.random().toString(36).substring(2, 9), timestamp: nowStr, author: studentName, role: 'Student', action: 'Complaint Submitted', note: `Submitted under ${data.category}.` }
      ]
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Send to backend async
    ticketApi.create({
      title: titleExtract,
      category: data.category,
      department: dept,
      urgency: data.category.includes('Anti-Ragging') ? 'critical' : 'medium',
      location: data.location,
      description: data.description,
      studentRegNo: regNo,
      studentName: studentName,
      studentEmail: studentEmail,
      studentDept: authUser.department,
      attachments: data.attachments
    }).then(() => fetchComplaints()).catch(() => {});

    // Create Notification
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: `📬 Complaint Registered: ${newId}`,
      message: `Your complaint has been submitted under ${dept}. ID: ${newId}`,
      timestamp: 'Just now',
      read: false,
      complaintId: newId,
      type: 'status_update'
    };
    setNotifications(prev => [newNotif, ...prev]);

    playNotificationChime();
    addToast('success', 'Complaint Registered!', `Complaint ID: ${newId} submitted.`);

    return newId;
  };

  const updateComplaintStatus = async (id: string, status: string, responseRemarks?: string) => {
    const updatedBy = authUser?.name || 'Admin';
    const role = authUser?.role === 'super_admin' ? 'Super Admin' : (authUser?.role === 'dept_admin' ? 'Department Admin' : 'Admin');
    const remarks = responseRemarks || (status.toLowerCase() === 'rejected' ? 'Complaint rejected after official verification.' : `Status updated to ${status}.`);

    // Local state update
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString('en-IN'),
            author: updatedBy,
            role,
            action: `Status -> ${status}`,
            note: remarks
          };
          return {
            ...c,
            status: status.toLowerCase(),
            responseRemarks: remarks,
            updatedAt: 'Just now',
            auditLogs: [newLog, ...(c.auditLogs || [])]
          };
        }
        return c;
      })
    );

    // Call backend
    try {
      await ticketApi.updateStatus(id, status, remarks, updatedBy, role);
    } catch (e) {}

    // Notification
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: `⚡ Complaint Status Updated: ${id}`,
      message: `Complaint ${id} status updated to ${status.toUpperCase()}. Remarks: ${remarks}`,
      timestamp: 'Just now',
      read: false,
      complaintId: id,
      type: 'status_update'
    };
    setNotifications(prev => [newNotif, ...prev]);

    addToast('info', 'Status Updated', `Complaint ${id} set to ${status}.`);
  };

  const assignComplaint = async (id: string, agentName: string, role?: string, department?: string) => {
    const updatedBy = authUser?.name || 'Super Admin';

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            assignedAgent: { name: agentName, role: role || 'Technician', department: department || c.department },
            department: department || c.department,
            status: c.status === 'new' ? 'investigating' : c.status,
            updatedAt: 'Just now'
          };
        }
        return c;
      })
    );

    try {
      await ticketApi.assign(id, agentName, role, department, updatedBy);
    } catch (e) {}

    addToast('success', 'Complaint Assigned', `Assigned Complaint ${id} to ${agentName}.`);
  };

  const addAuditRemarks = async (id: string, note: string) => {
    const author = authUser?.name || 'Admin Officer';
    const role = authUser?.role === 'super_admin' ? 'Super Admin' : 'Department Admin';

    try {
      await ticketApi.addNote(id, note, author, role);
    } catch (e) {}

    fetchComplaints();
    addToast('info', 'Remarks Saved', `Added remarks to Complaint ${id}.`);
  };

  // ── SIGNUP VERIFICATION ACTIONS ───────────────────────────────────────────
  const checkSignupStatus = (regNo: string): { status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_FOUND'; reason?: string } => {
    const cleanedRegNo = regNo.trim().toUpperCase();
    const req = signupRequests.find(r => r.regNo.toUpperCase() === cleanedRegNo);
    if (!req) return { status: 'NOT_FOUND' };
    return { status: req.status, reason: req.rejectionReason || undefined };
  };

  const submitSignupRequest = async (data: {
    regNo: string;
    fullName: string;
    email: string;
    department: string;
    year: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const cleanedRegNo = data.regNo.trim().toUpperCase();
    if (!isValidRegistrationNumber(cleanedRegNo)) {
      return { success: false, message: 'Invalid Registration Number format!' };
    }

    try {
      await authApi.submitSignupRequest(data);
      fetchSignupRequests();
      addToast('info', 'Request Submitted', `Signup request for ${cleanedRegNo} sent to Super Admin.`);
      return { success: true, message: `Account creation request for Registration Number ${cleanedRegNo} submitted! Pending Super Admin verification.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to submit signup request.' };
    }
  };

  const approveSignupRequest = async (requestId: string) => {
    const reqItem = signupRequests.find(r => r.id === requestId);
    if (!reqItem) return;

    try {
      await authApi.approveSignupRequest(requestId);
    } catch (e) {}

    setSignupRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'APPROVED', rejectionReason: null } : r))
    );

    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: `🎉 Registration Request Approved!`,
      message: `Your account for Reg No: ${reqItem.regNo} (${reqItem.fullName}) has been APPROVED and activated by Super Admin. Welcome to ResolveHub!`,
      timestamp: 'Just now',
      read: false,
      complaintId: '',
      type: 'announcement',
      targetRegNo: reqItem.regNo.toUpperCase(),
      targetRole: 'student'
    };
    setNotifications(prev => [newNotif, ...prev]);

    fetchStudents();
    playNotificationChime();
    addToast('success', 'Student Account Approved!', `Reg No: ${reqItem.regNo} account is now ACTIVE.`);
  };

  const rejectSignupRequest = async (requestId: string, reason?: string) => {
    const reqItem = signupRequests.find(r => r.id === requestId);
    if (!reqItem) return;

    const rejectionReason = reason || 'Registration details could not be verified with college registry.';

    try {
      await authApi.rejectSignupRequest(requestId, rejectionReason);
    } catch (e) {}

    setSignupRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'REJECTED', rejectionReason } : r))
    );

    addToast('warning', 'Signup Request Rejected', `Request for ${reqItem.regNo} rejected.`);
  };

  // ── ADMIN MANAGEMENT ACTIONS ──────────────────────────────────────────────
  const createDeptAdmin = async (data: { name: string; username: string; password: string; department: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      await authApi.createAdmin({ ...data, role: 'dept_admin' });
      fetchAdmins();
      fetchActivityLogs();
      addToast('success', 'Department Admin Created!', `Account created for ${data.name} (${data.department}).`);
      return { success: true, message: `Department Admin "${data.name}" created successfully for ${data.department}.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to create Department Admin account.' };
    }
  };

  const toggleAdminStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await authApi.toggleAdminStatus(id, nextStatus);
    } catch (e) {}

    setAdminsList(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    addToast('info', 'Admin Status Updated', `Admin account status set to ${nextStatus}.`);
  };

  const deleteAdminAccount = async (id: string) => {
    try {
      await authApi.deleteAdmin(id);
    } catch (e) {}
    setAdminsList(prev => prev.filter(a => a.id !== id));
    addToast('warning', 'Admin Removed', 'Admin account has been removed.');
  };

  // ── STUDENT MANAGEMENT ACTIONS ───────────────────────────────────────────
  const toggleStudentStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await authApi.toggleStudentStatus(id, nextStatus);
    } catch (e) {}

    setStudentsList(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    addToast('info', 'Student Status Updated', `Student account set to ${nextStatus}.`);
  };

  // ── SYSTEM SETTINGS & AUDIT LOGS ─────────────────────────────────────────
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = { ...systemSettings, ...newSettings };
    setSystemSettings(updated);
    try {
      await authApi.updateSettings(updated);
    } catch (e) {}
    addToast('success', 'Settings Saved', 'System configurations updated successfully.');
  };

  const clearDatabase = () => {
    setComplaints([]);
    setNotifications([]);
    setSignupRequests([]);
    localStorage.removeItem(LOCAL_STORAGE_COMPLAINTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_NOTIFS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SIGNUP_REQ_KEY);
    addToast('info', 'Database Reset', 'All campus complaint records cleared.');
  };

  return (
    <ResolveHubContext.Provider
      value={{
        activeView,
        setActiveView,
        authUser,
        userLoggedIn,
        userRole,
        loginUser,
        logoutUser,
        currentUserRegNo,
        loginWithRegNo,
        logout,
        complaints,
        selectedComplaint,
        setSelectedComplaint,
        submitComplaint,
        updateComplaintStatus,
        assignComplaint,
        addAuditRemarks,
        fetchComplaints,
        signupRequests,
        submitSignupRequest,
        approveSignupRequest,
        rejectSignupRequest,
        checkSignupStatus,
        adminsList,
        fetchAdmins,
        createDeptAdmin,
        toggleAdminStatus,
        deleteAdminAccount,
        studentsList,
        fetchStudents,
        toggleStudentStatus,
        systemSettings,
        updateSettings,
        activityLogs,
        fetchActivityLogs,
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        trackQuery,
        setTrackQuery,
        clearDatabase,
        isLoginModalOpen,
        setIsLoginModalOpen,
        toasts,
        addToast,
        removeToast,
        pushBanner,
        dismissPushBanner
      }}
    >
      {children}
    </ResolveHubContext.Provider>
  );
};

export const useResolveHub = () => {
  const context = useContext(ResolveHubContext);
  if (!context) {
    throw new Error('useResolveHub must be used within a ResolveHubProvider');
  }
  return context;
};
