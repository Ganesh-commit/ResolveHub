// ── Base URL ──────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Token retrieval helper
const getStoredToken = () => {
  try {
    const saved = localStorage.getItem('resolvehub_auth_session_2026');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.token || null;
    }
  } catch (e) {}
  return null;
};

// ── Generic fetch wrapper ─────────────────────────────────────────────────
async function apiFetch(path: string, options?: RequestInit): Promise<any> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...options?.headers as Record<string, string>
  };

  if (!(options?.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({ success: false, error: 'Server returned invalid JSON response' }));
  if (!res.ok || !json.success) {
    const errObj: any = new Error(json.error || json.message || 'API request failed');
    errObj.status = res.status;
    errObj.data = json;
    throw errObj;
  }

  return json.data !== undefined ? json : json;
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
    return apiFetch(`/tickets${qStr}`).then(res => Array.isArray(res.data) ? res.data : res);
  },

  /** Fetch one ticket by ID */
  getOne: (id: string) => apiFetch(`/tickets/${id}`).then(res => res.data || res),

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
    apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => res.data || res),

  /** Update ticket status & remarks */
  updateStatus: (id: string, status: string, responseRemarks?: string, updatedBy?: string, role?: string) =>
    apiFetch(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseRemarks, updatedBy, role }),
    }).then(res => res.data || res),

  /** Assign a staff agent or department */
  assign: (id: string, agentName: string, role?: string, department?: string, updatedBy?: string) =>
    apiFetch(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ agentName, role, department, updatedBy }),
    }).then(res => res.data || res),

  /** Escalate ticket to critical */
  escalate: (id: string) =>
    apiFetch(`/tickets/${id}/escalate`, { method: 'PATCH' }).then(res => res.data || res),

  /** Add audit note / response remarks */
  addNote: (id: string, note: string, author?: string, role?: string) =>
    apiFetch(`/tickets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, author, role }),
    }).then(res => res.data || res),

  /** Public ticket tracking */
  track: (id: string) => apiFetch(`/tickets/track/${id}`).then(res => res.data || res),
};

// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  /** Login for Student, Dept Admin, or Super Admin */
  login: (username: string, password: string, role?: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, regNo: username, password, role }),
    }),

  /** Verify session & fetch user profile */
  getMe: () => apiFetch('/auth/me'),

  /** Submit student signup / account creation request */
  submitSignupRequest: (data: {
    regNo: string;
    fullName: string;
    email: string;
    phone?: string;
    department?: string;
    year?: string;
    password: string;
    confirmPassword: string;
  }) =>
    apiFetch('/auth/signup-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Fetch all signup requests for Admin verification */
  getSignupRequests: () => apiFetch('/auth/signup-requests'),

  /** Check request status for a registration number */
  checkStatus: (regNo: string) => apiFetch(`/auth/check-status/${encodeURIComponent(regNo)}`),

  /** Admin approve signup request */
  approveSignupRequest: (id: string) =>
    apiFetch(`/auth/signup-requests/${id}/approve`, {
      method: 'POST',
    }),

  /** Admin reject signup request */
  rejectSignupRequest: (id: string, reason?: string) =>
    apiFetch(`/auth/signup-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  /** Upload profile photo avatar */
  uploadAvatar: (formData: FormData) =>
    apiFetch('/auth/me/avatar', {
      method: 'PUT',
      body: formData,
    }),

  /** Delete profile photo avatar */
  deleteAvatar: () =>
    apiFetch('/auth/me/avatar', {
      method: 'DELETE',
    }),

  /** Update profile name, phone, email & change password */
  updateProfile: (data: {
    fullName?: string;
    name?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) =>
    apiFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Super Admin reset student password */
  resetStudentPassword: (id: string, newPassword: string) =>
    apiFetch(`/auth/students/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),

  /** Student Management (Super Admin) */
  getStudents: () => apiFetch('/auth/students'),
  toggleStudentStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    apiFetch(`/auth/students/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  deleteStudent: (id: string) =>
    apiFetch(`/auth/students/${id}`, {
      method: 'DELETE'
    }),

  /** Admin Management (Super Admin) */
  getAdmins: () => apiFetch('/auth/admins'),
  createAdmin: (data: { name: string; username: string; password: string; department: string; role?: string }) =>
    apiFetch('/auth/admins', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  toggleAdminStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    apiFetch(`/auth/admins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  deleteAdmin: (id: string) =>
    apiFetch(`/auth/admins/${id}`, {
      method: 'DELETE'
    }),

  /** System Settings */
  getSettings: () => apiFetch('/auth/settings'),
  updateSettings: (settings: any) =>
    apiFetch('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  /** Activity Audit Logs */
  getActivityLogs: () => apiFetch('/auth/activity-logs'),

  /** Dashboard statistics */
  getStats: (department?: string) => apiFetch(`/auth/stats${department ? `?department=${encodeURIComponent(department)}` : ''}`),
};

// ── Health check ──────────────────────────────────────────────────────────
export const checkHealth = () =>
  fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status: 'offline' }));
