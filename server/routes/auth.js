const express = require('express');
const router = express.Router();
const { db, uuidv4, hashPassword, verifyPassword, logActivity } = require('../db');

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, regNo, password, role } = req.body;
  const loginIdentifier = (regNo || username || '').trim();
  const pwd = (password || '').trim();

  if (!loginIdentifier || !pwd) {
    return res.status(400).json({ success: false, error: 'Registration Number / Username and Password required' });
  }

  // 1. Check Staff / Admin accounts
  const staff = db.get('staff').find(s => 
    s.username.toLowerCase() === loginIdentifier.toLowerCase()
  ).value();

  if (staff) {
    if (staff.status === 'INACTIVE') {
      return res.status(403).json({ success: false, error: 'This Admin account has been deactivated by Super Admin.' });
    }
    if (!verifyPassword(pwd, staff.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
    }

    logActivity(staff.name, staff.role === 'super_admin' ? 'Super Admin' : 'Department Admin', 'Admin Sign In', `Signed in from control panel (${staff.department || 'All'})`);

    return res.json({
      success: true,
      data: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        role: staff.role, // 'super_admin' or 'dept_admin'
        department: staff.department || 'All Departments',
        token: `auth-token-${staff.id}`
      }
    });
  }

  // 2. Check Student accounts in 'users' collection
  const user = db.get('users').find(u => 
    u.regNo.toUpperCase() === loginIdentifier.toUpperCase()
  ).value();

  if (user) {
    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, error: 'Your student account is deactivated. Please contact Super Admin.' });
    }
    if (!verifyPassword(pwd, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid Student Password.' });
    }

    logActivity(user.fullName, 'Student', 'Student Sign In', `Reg No: ${user.regNo} logged into student dashboard.`);

    return res.json({
      success: true,
      data: {
        id: user.id,
        regNo: user.regNo,
        name: user.fullName,
        email: user.email,
        department: user.department,
        year: user.year,
        role: 'student',
        token: `auth-token-${user.id}`
      }
    });
  }

  // 3. Check Pending Signup Requests
  const reqItem = db.get('signupRequests').find(r => 
    r.regNo.toUpperCase() === loginIdentifier.toUpperCase()
  ).value();

  if (reqItem) {
    if (reqItem.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        error: `Your account signup request for ${loginIdentifier.toUpperCase()} is PENDING Super Admin verification. Please wait for Admin approval.`
      });
    }
    if (reqItem.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        error: `Your signup request for ${loginIdentifier.toUpperCase()} was REJECTED by Admin. Reason: ${reqItem.rejectionReason || 'Invalid records'}`
      });
    }
    if (reqItem.status === 'APPROVED') {
      if (verifyPassword(pwd, reqItem.passwordHash || hashPassword(reqItem.regNo))) {
        // Auto-create user record if missing
        const newUser = {
          id: `usr-${uuidv4().substring(0, 8)}`,
          regNo: reqItem.regNo,
          fullName: reqItem.fullName,
          email: reqItem.email,
          department: reqItem.department,
          year: reqItem.year,
          passwordHash: reqItem.passwordHash || hashPassword(pwd),
          status: 'ACTIVE',
          activatedAt: new Date().toLocaleString()
        };
        db.get('users').push(newUser).write();

        return res.json({
          success: true,
          data: {
            id: newUser.id,
            regNo: newUser.regNo,
            name: newUser.fullName,
            email: newUser.email,
            department: newUser.department,
            role: 'student',
            token: `auth-token-${newUser.id}`
          }
        });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid Student Password.' });
      }
    }
  }

  return res.status(404).json({
    success: false,
    error: `No account or signup request found for Registration Number / Username "${loginIdentifier}". Please click 'Request Student Account' to submit a registration request.`
  });
});

// ── POST /api/auth/signup-request ───────────────────────────────────────────
router.post('/signup-request', (req, res) => {
  const { regNo, fullName, email, department, year, password } = req.body;
  if (!regNo || !fullName || !password) {
    return res.status(400).json({ success: false, error: 'Registration Number, Full Name, and Password are required' });
  }

  const cleanRegNo = regNo.trim().toUpperCase();

  const existingUser = db.get('users').find({ regNo: cleanRegNo }).value();
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: `An active account already exists for Registration Number ${cleanRegNo}. Please log in directly.`
    });
  }

  const existingReq = db.get('signupRequests').find({ regNo: cleanRegNo }).value();
  if (existingReq) {
    if (existingReq.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `A signup request for Registration Number ${cleanRegNo} is already pending Admin verification.`
      });
    }
    if (existingReq.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: `An account for ${cleanRegNo} has already been approved. Please log in directly.`
      });
    }

    const updated = db.get('signupRequests')
      .find({ regNo: cleanRegNo })
      .assign({
        fullName: fullName.trim(),
        email: email ? email.trim() : `${cleanRegNo.toLowerCase()}@campus.edu`,
        department: department || 'Computer Science & Engineering (CSE)',
        year: year || '1st Year',
        passwordHash: hashPassword(password.trim()),
        status: 'PENDING',
        createdAt: new Date().toLocaleString(),
        rejectionReason: null
      })
      .write();

    logActivity('Student Intake', 'Student', 'Signup Re-submitted', `Reg No: ${cleanRegNo} re-submitted signup request.`);

    return res.json({
      success: true,
      message: `Registration request for ${cleanRegNo} has been re-submitted for Admin verification.`,
      data: updated
    });
  }

  const newRequest = {
    id: `req-${uuidv4().substring(0, 8)}`,
    regNo: cleanRegNo,
    fullName: fullName.trim(),
    email: email ? email.trim() : `${cleanRegNo.toLowerCase()}@campus.edu`,
    department: department || 'Computer Science & Engineering (CSE)',
    year: year || '1st Year',
    passwordHash: hashPassword(password.trim()),
    status: 'PENDING',
    createdAt: new Date().toLocaleString(),
    rejectionReason: null
  };

  db.get('signupRequests').push(newRequest).write();

  logActivity('Student Intake', 'Student', 'Signup Requested', `Reg No: ${cleanRegNo} (${fullName}) created signup request.`);

  res.json({
    success: true,
    message: `Account creation request for Registration Number ${cleanRegNo} submitted successfully. Pending Super Admin verification.`,
    data: newRequest
  });
});

// ── GET /api/auth/signup-requests ──────────────────────────────────────────
router.get('/signup-requests', (_req, res) => {
  const requests = db.get('signupRequests').value() || [];
  res.json({ success: true, data: requests });
});

// ── POST /api/auth/signup-requests/:id/approve ───────────────────────────
router.post('/signup-requests/:id/approve', (req, res) => {
  const { id } = req.params;
  const reqItem = db.get('signupRequests').find({ id }).value();
  if (!reqItem) {
    return res.status(404).json({ success: false, error: 'Signup request not found' });
  }

  db.get('signupRequests').find({ id }).assign({ status: 'APPROVED' }).write();

  let user = db.get('users').find({ regNo: reqItem.regNo }).value();
  if (!user) {
    user = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      regNo: reqItem.regNo,
      fullName: reqItem.fullName,
      email: reqItem.email,
      department: reqItem.department,
      year: reqItem.year,
      passwordHash: reqItem.passwordHash || hashPassword(reqItem.regNo),
      status: 'ACTIVE',
      activatedAt: new Date().toLocaleString()
    };
    db.get('users').push(user).write();
  } else {
    db.get('users').find({ regNo: reqItem.regNo }).assign({ status: 'ACTIVE' }).write();
  }

  logActivity('Super Admin', 'Super Admin', 'Student Signup Approved', `Approved Reg No: ${reqItem.regNo} (${reqItem.fullName}). Account activated.`);

  res.json({
    success: true,
    message: `Account for Student ${reqItem.regNo} (${reqItem.fullName}) has been APPROVED and activated!`,
    data: user
  });
});

// ── POST /api/auth/signup-requests/:id/reject ────────────────────────────
router.post('/signup-requests/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const reqItem = db.get('signupRequests').find({ id }).value();
  if (!reqItem) {
    return res.status(404).json({ success: false, error: 'Signup request not found' });
  }

  const rejectionReason = reason || 'Registration details could not be verified with college registry.';

  db.get('signupRequests')
    .find({ id })
    .assign({ status: 'REJECTED', rejectionReason })
    .write();

  logActivity('Super Admin', 'Super Admin', 'Student Signup Rejected', `Rejected Reg No: ${reqItem.regNo}. Reason: ${rejectionReason}`);

  res.json({
    success: true,
    message: `Account request for ${reqItem.regNo} REJECTED.`,
    data: { ...reqItem, status: 'REJECTED', rejectionReason }
  });
});

// ── GET /api/auth/students — Super Admin Student Management ─────────────────
router.get('/students', (_req, res) => {
  const students = db.get('users').value() || [];
  res.json({ success: true, data: students });
});

// ── PATCH /api/auth/students/:id/status ────────────────────────────────────
router.patch('/students/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
  const student = db.get('users').find({ id });
  if (!student.value()) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }

  student.assign({ status }).write();
  logActivity('Super Admin', 'Super Admin', 'Student Status Changed', `Updated Student ${student.value().regNo} status to ${status}`);

  res.json({ success: true, data: student.value() });
});

// ── GET /api/auth/admins — Super Admin Admin Management ───────────────────
router.get('/admins', (_req, res) => {
  const staff = db.get('staff').value() || [];
  // Exclude password hashes from response
  const sanitized = staff.map(({ passwordHash, ...rest }) => rest);
  res.json({ success: true, data: sanitized });
});

// ── POST /api/auth/admins — ONLY Super Admin can create Department Admins ─────
router.post('/admins', (req, res) => {
  const { name, username, password, department, role = 'dept_admin' } = req.body;

  if (!name || !username || !password || !department) {
    return res.status(400).json({ success: false, error: 'Name, Username, Password, and Department are required' });
  }

  const cleanUsername = username.trim().toLowerCase();

  const existing = db.get('staff').find(s => s.username.toLowerCase() === cleanUsername).value();
  if (existing) {
    return res.status(400).json({ success: false, error: `An Admin account with username "${cleanUsername}" already exists.` });
  }

  const newAdmin = {
    id: `admin-dept-${uuidv4().substring(0, 6)}`,
    username: cleanUsername,
    passwordHash: hashPassword(password.trim()),
    name: name.trim(),
    role: role === 'super_admin' ? 'super_admin' : 'dept_admin',
    department: department.trim(),
    status: 'ACTIVE',
    createdAt: new Date().toLocaleString()
  };

  db.get('staff').push(newAdmin).write();

  logActivity('Super Admin', 'Super Admin', 'New Admin Created', `Created ${newAdmin.role === 'super_admin' ? 'Super Admin' : 'Dept Admin (' + newAdmin.department + ')'}: ${newAdmin.name} (${newAdmin.username})`);

  const { passwordHash, ...safeAdmin } = newAdmin;
  res.status(201).json({ success: true, message: `Admin account for ${name} (${department}) created successfully!`, data: safeAdmin });
});

// ── PATCH /api/auth/admins/:id/status ──────────────────────────────────────
router.patch('/admins/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
  const adminItem = db.get('staff').find({ id });
  if (!adminItem.value()) {
    return res.status(404).json({ success: false, error: 'Admin account not found' });
  }

  adminItem.assign({ status }).write();
  logActivity('Super Admin', 'Super Admin', 'Admin Status Changed', `Updated Admin ${adminItem.value().username} status to ${status}`);

  const { passwordHash, ...safeAdmin } = adminItem.value();
  res.json({ success: true, data: safeAdmin });
});

// ── DELETE /api/auth/admins/:id ─────────────────────────────────────────────
router.delete('/admins/:id', (req, res) => {
  const { id } = req.params;
  const adminItem = db.get('staff').find({ id }).value();
  if (!adminItem) return res.status(404).json({ success: false, error: 'Admin not found' });
  if (adminItem.role === 'super_admin' && adminItem.username === 'superadmin') {
    return res.status(400).json({ success: false, error: 'Cannot delete primary System Super Admin account.' });
  }

  db.get('staff').remove({ id }).write();
  logActivity('Super Admin', 'Super Admin', 'Admin Removed', `Removed admin account ${adminItem.username} (${adminItem.department})`);

  res.json({ success: true, message: `Admin ${adminItem.name} removed successfully.` });
});

// ── GET /api/auth/settings — System Settings ────────────────────────────────
router.get('/settings', (_req, res) => {
  const settings = db.get('systemSettings').value();
  res.json({ success: true, data: settings });
});

// ── PUT /api/auth/settings — Manage System Settings ──────────────────────────
router.put('/settings', (req, res) => {
  const { categories, departments, priorities, slaHours } = req.body;

  const current = db.get('systemSettings').value();
  const updated = {
    categories: categories || current.categories,
    departments: departments || current.departments,
    priorities: priorities || current.priorities,
    slaHours: slaHours || current.slaHours
  };

  db.set('systemSettings', updated).write();
  logActivity('Super Admin', 'Super Admin', 'System Settings Updated', 'Updated complaint categories, departments, and SLA configurations.');

  res.json({ success: true, message: 'System settings updated successfully.', data: updated });
});

// ── GET /api/auth/activity-logs — System Audit Logs ────────────────────────
router.get('/activity-logs', (_req, res) => {
  const logs = db.get('activityLogs').value() || [];
  res.json({ success: true, data: logs });
});

// ── GET /api/auth/stats — Scoped Statistics ────────────────────────────────
router.get('/stats', (req, res) => {
  const { department } = req.query; // If provided, filter for Department Admin
  let tickets = db.get('tickets').value() || [];
  const requests = db.get('signupRequests').value() || [];
  const students = db.get('users').value() || [];
  const admins = db.get('staff').value() || [];

  if (department && department !== 'all' && department !== 'All Departments') {
    tickets = tickets.filter(t => t.department === department);
  }

  const total = tickets.length;
  const newCount = tickets.filter(t => t.status === 'new' || t.status === 'Submitted').length;
  const inProgress = tickets.filter(t => ['investigating', 'dispatched', 'Under Review', 'In Progress'].includes(t.status)).length;
  const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'Resolved').length;
  const rejected = tickets.filter(t => t.status === 'rejected' || t.status === 'Rejected').length;
  const critical = tickets.filter(t => t.urgency === 'critical' || t.urgency === 'Urgent').length;
  const pendingSignups = requests.filter(r => r.status === 'PENDING').length;

  const catMap = {};
  tickets.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + 1; });
  const byCategory = Object.entries(catMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);

  const deptMap = {};
  tickets.forEach(t => {
    if (!deptMap[t.department]) deptMap[t.department] = { total: 0, resolved_count: 0, pending_count: 0 };
    deptMap[t.department].total++;
    if (t.status === 'resolved' || t.status === 'Resolved') deptMap[t.department].resolved_count++;
    else deptMap[t.department].pending_count++;
  });
  const byDept = Object.entries(deptMap).map(([dept, v]) => ({ department: dept, ...v }));

  res.json({
    success: true,
    data: {
      total,
      newCount,
      inProgress,
      resolved,
      rejected,
      critical,
      totalStudents: students.length,
      totalAdmins: admins.length,
      pendingSignups,
      byCategory,
      byDept
    }
  });
});

module.exports = router;

