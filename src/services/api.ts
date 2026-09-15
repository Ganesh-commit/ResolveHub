// ── Base URL ──────────────────────────────────────────────────────────────
const BASE = 'http://localhost:3001/api';

// ── Generic fetch wrapper ─────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data as T;
}

// ── Ticket API ────────────────────────────────────────────────────────────
export const ticketApi = {
  /** Fetch all tickets with role & search filtering */
  getAll: (params?: { role?: string; department?: string; regNo?: string; category?: string; status?: string; priority?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<any[]>(`/tickets${qStr}`);
  },

  /** Fetch one ticket by ID */
  getOne: (id: string) => apiFetch<any>(`/tickets/${id}`),

  /** Submit a new complaint */
  create: (data: {
    title?: string;
    category: string;
    department?: string;
    urgency?: string;
    location?: string;
    description: string;
    studentRegNo?: string;
    studentName?: string;
    studentEmail?: string;
    studentDept?: string;
    attachments?: Array<{ name: string; size: string; type: string }>;
  }) =>
    apiFetch<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Update ticket status & remarks */
  updateStatus: (id: string, status: string, responseRemarks?: string, updatedBy?: string, role?: string) =>
    apiFetch<any>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseRemarks, updatedBy, role }),
    }),

  /** Assign a staff agent or department */
  assign: (id: string, agentName: string, role?: string, department?: string, updatedBy?: string) =>
    apiFetch<any>(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ agentName, role, department, updatedBy }),
    }),

  /** Escalate ticket to critical */
  escalate: (id: string) =>
    apiFetch<any>(`/tickets/${id}/escalate`, { method: 'PATCH' }),

  /** Add audit note / response remarks */
  addNote: (id: string, note: string, author?: string, role?: string) =>
    apiFetch<any>(`/tickets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, author, role }),
    }),

  /** Public ticket tracking */
  track: (id: string) => apiFetch<any>(`/tickets/track/${id}`),
};

// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  /** Login for Student, Dept Admin, or Super Admin */
  login: (regNo: string, password: string, role?: string) =>
    apiFetch<{ id: string; name: string; role: string; username?: string; regNo?: string; email?: string; department?: string; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ regNo, username: regNo, password, role }),
    }),

  /** Submit student signup / account creation request */
  submitSignupRequest: (data: {
    regNo: string;
    fullName: string;
    email?: string;
    department?: string;
    year?: string;
    password: string;
  }) =>
    apiFetch<any>('/auth/signup-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Fetch all signup requests for Admin verification */
  getSignupRequests: () => apiFetch<any[]>('/auth/signup-requests'),

  /** Check request status for a registration number */
  checkStatus: (regNo: string) => apiFetch<any>(`/auth/check-status/${encodeURIComponent(regNo)}`),

  /** Admin approve signup request */
  approveSignupRequest: (id: string) =>
    apiFetch<any>(`/auth/signup-requests/${id}/approve`, {
      method: 'POST',
    }),

  /** Admin reject signup request */
  rejectSignupRequest: (id: string, reason?: string) =>
    apiFetch<any>(`/auth/signup-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  /** Student Management (Super Admin) */
  getStudents: () => apiFetch<any[]>('/auth/students'),
  toggleStudentStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    apiFetch<any>(`/auth/students/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  /** Admin Management (Super Admin) */
  getAdmins: () => apiFetch<any[]>('/auth/admins'),
  createAdmin: (data: { name: string; username: string; password: string; department: string; role?: string }) =>
    apiFetch<any>('/auth/admins', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  toggleAdminStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    apiFetch<any>(`/auth/admins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  deleteAdmin: (id: string) =>
    apiFetch<any>(`/auth/admins/${id}`, {
      method: 'DELETE'
    }),

  /** System Settings */
  getSettings: () => apiFetch<any>('/auth/settings'),
  updateSettings: (settings: any) =>
    apiFetch<any>('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  /** Activity Audit Logs */
  getActivityLogs: () => apiFetch<any[]>('/auth/activity-logs'),

  /** Dashboard statistics (supports department filter) */
  getStats: (department?: string) => apiFetch<any>(`/auth/stats${department ? `?department=${encodeURIComponent(department)}` : ''}`),
};

// ── Health check ──────────────────────────────────────────────────────────
export const checkHealth = () =>
  fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status: 'offline' }));


