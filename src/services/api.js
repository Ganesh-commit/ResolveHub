const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL)
        return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api/v1';
    }
    return 'http://localhost:3001/api/v1';
};
const BASE = getBaseUrl();
// Token retrieval helper
const getStoredToken = () => {
    try {
        const saved = localStorage.getItem('resolvehub_auth_session_2026');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.token || null;
        }
    }
    catch (e) { }
    return null;
};
// ── Generic fetch wrapper ─────────────────────────────────────────────────
async function apiFetch(path, options) {
    const token = getStoredToken();
    const headers = {
        ...options?.headers
    };
    if (!(options?.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
        const res = await fetch(`${BASE}${path}`, {
            ...options,
            headers,
            signal: options?.signal || controller.signal
        });
        clearTimeout(timeoutId);
        const json = await res.json().catch(() => ({ success: false, error: 'Server returned invalid JSON response' }));
        if (!res.ok || !json.success) {
            const errObj = new Error(json.error || json.message || 'API request failed');
            errObj.status = res.status;
            errObj.data = json;
            throw errObj;
        }
        return json.data !== undefined ? json : json;
    }
    catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            const timeoutErr = new Error('Request timed out. Please try again.');
            timeoutErr.code = 'TIMEOUT';
            throw timeoutErr;
        }
        throw err;
    }
}
// ── Ticket API ────────────────────────────────────────────────────────────
export const ticketApi = {
    /** Fetch all tickets with role & search filtering */
    getAll: (params) => {
        const query = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v)
                    query.append(k, v);
            });
        }
        const qStr = query.toString() ? `?${query.toString()}` : '';
        return apiFetch(`/tickets${qStr}`).then(res => Array.isArray(res.data) ? res.data : res);
    },
    /** Fetch one ticket by ID */
    getOne: (id) => apiFetch(`/tickets/${id}`).then(res => res.data || res),
    /** Submit a new complaint (supports JSON or FormData with file attachments) */
    create: (data) => apiFetch('/tickets', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
    }).then(res => res.data || res),
    /** Delete a complaint and its attachments */
    delete: (id) => apiFetch(`/tickets/${id}`, { method: 'DELETE' }).then(res => res.data || res),
    /** Update ticket status & remarks */
    updateStatus: (id, status, responseRemarks, updatedBy, role) => apiFetch(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, responseRemarks, updatedBy, role }),
    }).then(res => res.data || res),
    /** Assign a staff agent or department */
    assign: (id, agentName, role, department, updatedBy) => apiFetch(`/tickets/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ agentName, role, department, updatedBy }),
    }).then(res => res.data || res),
    /** Escalate ticket to critical */
    escalate: (id) => apiFetch(`/tickets/${id}/escalate`, { method: 'PATCH' }).then(res => res.data || res),
    /** Add audit note / response remarks */
    addNote: (id, note, author, role) => apiFetch(`/tickets/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note, author, role }),
    }).then(res => res.data || res),
    /** SuperAdmin Smart Triage Auto-Routing Engine */
    smartRouteAll: () => apiFetch('/tickets/smart-route-all', {
        method: 'POST',
    }),
    /** Route or Retain single ticket by SuperAdmin */
    smartRouteOne: (id, payload) => apiFetch(`/tickets/${id}/smart-route`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    }).then(res => res.data || res),
    /** HOD marks ticket as Resolved with Proof -> Pending Student Verification */
    resolveWithProof: (id, remarks, proofUrl, updatedBy) => apiFetch(`/tickets/${id}/resolve-with-proof`, {
        method: 'POST',
        body: JSON.stringify({ remarks, proofUrl, updatedBy }),
    }).then(res => res.data || res),
    /** Student Two-Way Verification (Approve -> Resolved, or Dispute -> Reopen) */
    verifyResolution: (id, payload) => apiFetch(`/tickets/${id}/verify-resolution`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }).then(res => res.data || res),
    /** Public ticket tracking */
    track: (id) => apiFetch(`/tickets/track/${id}`).then(res => res.data || res),
};
// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
    /** Login for Student, Dept Admin, or Super Admin */
    login: (username, password, role) => apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, regNo: username, password, role }),
    }),
    /** Verify session & fetch user profile */
    getMe: () => apiFetch('/auth/me'),
    /** Submit student signup / account creation request */
    submitSignupRequest: (data) => apiFetch('/auth/signup-request', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    /** Fetch all signup requests for Admin verification */
    getSignupRequests: () => apiFetch('/auth/signup-requests').then(res => Array.isArray(res?.data) ? res.data : res),
    /** Check request status for a registration number */
    checkStatus: (regNo) => apiFetch(`/auth/check-status/${encodeURIComponent(regNo)}`),
    /** Admin approve signup request */
    approveSignupRequest: (id) => apiFetch(`/auth/signup-requests/${id}/approve`, {
        method: 'POST',
    }),
    /** Admin reject signup request */
    rejectSignupRequest: (id, reason) => apiFetch(`/auth/signup-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
    }),
    /** Admin delete signup request */
    deleteSignupRequest: (id) => apiFetch(`/auth/signup-requests/${id}`, {
        method: 'DELETE',
    }),
    /** Upload profile photo avatar */
    uploadAvatar: (formData) => apiFetch('/auth/me/avatar', {
        method: 'PUT',
        body: formData,
    }),
    /** Delete profile photo avatar */
    deleteAvatar: () => apiFetch('/auth/me/avatar', {
        method: 'DELETE',
    }),
    /** Update profile name, phone, email & change password */
    updateProfile: (data) => apiFetch('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    /** Super Admin reset student password */
    resetStudentPassword: (id, newPassword) => apiFetch(`/auth/students/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
    }),
    /** Student Management (Super Admin) */
    getStudents: () => apiFetch('/auth/students').then(res => Array.isArray(res?.data) ? res.data : res),
    toggleStudentStatus: (id, status) => apiFetch(`/auth/students/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    }),
    deleteStudent: (id) => apiFetch(`/auth/students/${id}`, {
        method: 'DELETE'
    }),
    /** Admin Management (Super Admin) */
    getAdmins: () => apiFetch('/auth/admins').then(res => Array.isArray(res?.data) ? res.data : res),
    createAdmin: (data) => apiFetch('/auth/admins', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    toggleAdminStatus: (id, status) => apiFetch(`/auth/admins/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    }),
    deleteAdmin: (id) => apiFetch(`/auth/admins/${id}`, {
        method: 'DELETE'
    }),
    /** System Settings */
    getSettings: () => apiFetch('/auth/settings').then(res => res?.data || res),
    updateSettings: (settings) => apiFetch('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
    }),
    /** Activity Audit Logs */
    getActivityLogs: () => apiFetch('/auth/activity-logs').then(res => Array.isArray(res?.data) ? res.data : res),
    /** Dashboard statistics */
    getStats: (department) => apiFetch(`/auth/stats${department ? `?department=${encodeURIComponent(department)}` : ''}`),
};
// ── Health check ──────────────────────────────────────────────────────────
export const checkHealth = () => fetch(`${BASE}/health`).then(r => r.json()).catch(() => ({ status: 'offline' }));
