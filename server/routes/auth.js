const express = require('express');
const router = express.Router();
const { 
  Staff, 
  User, 
  SignupRequest, 
  ActivityLog, 
  SystemSetting, 
  Ticket, 
  uuidv4, 
  hashPassword, 
  verifyPassword, 
  logActivity 
} = require('../db');

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, regNo, password, role } = req.body;
    const loginIdentifier = (regNo || username || '').trim();
    const pwd = (password || '').trim();

    if (!loginIdentifier || !pwd) {
      return res.status(400).json({ success: false, error: 'Registration Number / Username and Password required' });
    }

    // 1. Check Staff / Admin accounts
    const staff = await Staff.findOne({ username: loginIdentifier.toLowerCase() });

    if (staff) {
      if (staff.status === 'INACTIVE') {
        return res.status(403).json({ success: false, error: 'This Admin account has been deactivated by Super Admin.' });
      }
      if (!verifyPassword(pwd, staff.passwordHash)) {
        return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
      }

      await logActivity(staff.name, staff.role === 'super_admin' ? 'Super Admin' : 'Department Admin', 'Admin Sign In', `Signed in from control panel (${staff.department || 'All'})`);

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
    const user = await User.findOne({ regNo: loginIdentifier.toUpperCase() });

    if (user) {
      if (user.status === 'INACTIVE') {
        return res.status(403).json({ success: false, error: 'Your student account is deactivated. Please contact Super Admin.' });
      }
      if (!verifyPassword(pwd, user.passwordHash)) {
        return res.status(401).json({ success: false, error: 'Invalid Student Password.' });
      }

      await logActivity(user.fullName, 'Student', 'Student Sign In', `Reg No: ${user.regNo} logged into student dashboard.`);

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
    const reqItem = await SignupRequest.findOne({ regNo: loginIdentifier.toUpperCase() });

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
          const newUser = new User({
            id: `usr-${uuidv4().substring(0, 8)}`,
            regNo: reqItem.regNo,
            fullName: reqItem.fullName,
            email: reqItem.email,
            department: reqItem.department,
            year: reqItem.year,
            passwordHash: reqItem.passwordHash || hashPassword(pwd),
            status: 'ACTIVE',
            activatedAt: new Date().toLocaleString()
          });
          await newUser.save();

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
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/signup-request ───────────────────────────────────────────
router.post('/signup-request', async (req, res) => {
  try {
    const { regNo, fullName, email, department, year, password } = req.body;
    if (!regNo || !fullName || !password) {
      return res.status(400).json({ success: false, error: 'Registration Number, Full Name, and Password are required' });
    }

    const cleanRegNo = regNo.trim().toUpperCase();

    const existingUser = await User.findOne({ regNo: cleanRegNo });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: `An active account already exists for Registration Number ${cleanRegNo}. Please log in directly.`
      });
    }

    const existingReq = await SignupRequest.findOne({ regNo: cleanRegNo });
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

      existingReq.fullName = fullName.trim();
      existingReq.email = email ? email.trim() : `${cleanRegNo.toLowerCase()}@campus.edu`;
      existingReq.department = department || 'Computer Science & Engineering (CSE)';
      existingReq.year = year || '1st Year';
      existingReq.passwordHash = hashPassword(password.trim());
      existingReq.status = 'PENDING';
      existingReq.createdAt = new Date().toLocaleString();
      existingReq.rejectionReason = null;

      await existingReq.save();
      await logActivity('Student Intake', 'Student', 'Signup Re-submitted', `Reg No: ${cleanRegNo} re-submitted signup request.`);

      return res.json({
        success: true,
        message: `Registration request for ${cleanRegNo} has been re-submitted for Admin verification.`,
        data: existingReq
      });
    }

    const newRequest = new SignupRequest({
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
    });

    await newRequest.save();
    await logActivity('Student Intake', 'Student', 'Signup Requested', `Reg No: ${cleanRegNo} (${fullName}) created signup request.`);

    res.json({
      success: true,
      message: `Account creation request for Registration Number ${cleanRegNo} submitted successfully. Pending Super Admin verification.`,
      data: newRequest
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/signup-requests ──────────────────────────────────────────
router.get('/signup-requests', async (_req, res) => {
  try {
    const requests = await SignupRequest.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/signup-requests/:id/approve ───────────────────────────
router.post('/signup-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const reqItem = await SignupRequest.findOne({ id });
    if (!reqItem) {
      return res.status(404).json({ success: false, error: 'Signup request not found' });
    }

    reqItem.status = 'APPROVED';
    await reqItem.save();

    let user = await User.findOne({ regNo: reqItem.regNo });
    if (!user) {
      user = new User({
        id: `usr-${uuidv4().substring(0, 8)}`,
        regNo: reqItem.regNo,
        fullName: reqItem.fullName,
        email: reqItem.email,
        department: reqItem.department,
        year: reqItem.year,
        passwordHash: reqItem.passwordHash || hashPassword(reqItem.regNo),
        status: 'ACTIVE',
        activatedAt: new Date().toLocaleString()
      });
      await user.save();
    } else {
      user.status = 'ACTIVE';
      await user.save();
    }

    await logActivity('Super Admin', 'Super Admin', 'Student Signup Approved', `Approved Reg No: ${reqItem.regNo} (${reqItem.fullName}). Account activated.`);

    res.json({
      success: true,
      message: `Account for Student ${reqItem.regNo} (${reqItem.fullName}) has been APPROVED and activated!`,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/signup-requests/:id/reject ────────────────────────────
router.post('/signup-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reqItem = await SignupRequest.findOne({ id });
    if (!reqItem) {
      return res.status(404).json({ success: false, error: 'Signup request not found' });
    }

    const rejectionReason = reason || 'Registration details could not be verified with college registry.';

    reqItem.status = 'REJECTED';
    reqItem.rejectionReason = rejectionReason;
    await reqItem.save();

    await logActivity('Super Admin', 'Super Admin', 'Student Signup Rejected', `Rejected Reg No: ${reqItem.regNo}. Reason: ${rejectionReason}`);

    res.json({
      success: true,
      message: `Account request for ${reqItem.regNo} REJECTED.`,
      data: reqItem
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/students — Super Admin Student Management ─────────────────
router.get('/students', async (_req, res) => {
  try {
    const students = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/auth/students/:id/status ────────────────────────────────────
router.patch('/students/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
    const student = await User.findOne({ id });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    student.status = status;
    await student.save();
    await logActivity('Super Admin', 'Super Admin', 'Student Status Changed', `Updated Student ${student.regNo} status to ${status}`);

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/admins — Super Admin Admin Management ───────────────────
router.get('/admins', async (_req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 }).lean();
    const sanitized = staff.map(({ passwordHash, ...rest }) => rest);
    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/admins — ONLY Super Admin can create Department Admins ─────
router.post('/admins', async (req, res) => {
  try {
    const { name, username, password, department, role = 'dept_admin' } = req.body;

    if (!name || !username || !password || !department) {
      return res.status(400).json({ success: false, error: 'Name, Username, Password, and Department are required' });
    }

    const cleanUsername = username.trim().toLowerCase();

    const existing = await Staff.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({ success: false, error: `An Admin account with username "${cleanUsername}" already exists.` });
    }

    const newAdmin = new Staff({
      id: `admin-dept-${uuidv4().substring(0, 6)}`,
      username: cleanUsername,
      passwordHash: hashPassword(password.trim()),
      name: name.trim(),
      role: role === 'super_admin' ? 'super_admin' : 'dept_admin',
      department: department.trim(),
      status: 'ACTIVE',
      createdAt: new Date().toLocaleString()
    });

    await newAdmin.save();

    await logActivity('Super Admin', 'Super Admin', 'New Admin Created', `Created ${newAdmin.role === 'super_admin' ? 'Super Admin' : 'Dept Admin (' + newAdmin.department + ')'}: ${newAdmin.name} (${newAdmin.username})`);

    const { passwordHash, ...safeAdmin } = newAdmin.toObject();
    res.status(201).json({ success: true, message: `Admin account for ${name} (${department}) created successfully!`, data: safeAdmin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/auth/admins/:id/status ──────────────────────────────────────
router.patch('/admins/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
    const adminItem = await Staff.findOne({ id });
    if (!adminItem) {
      return res.status(404).json({ success: false, error: 'Admin account not found' });
    }

    adminItem.status = status;
    await adminItem.save();
    await logActivity('Super Admin', 'Super Admin', 'Admin Status Changed', `Updated Admin ${adminItem.username} status to ${status}`);

    const { passwordHash, ...safeAdmin } = adminItem.toObject();
    res.json({ success: true, data: safeAdmin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/auth/admins/:id ─────────────────────────────────────────────
router.delete('/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const adminItem = await Staff.findOne({ id });
    if (!adminItem) return res.status(404).json({ success: false, error: 'Admin not found' });
    if (adminItem.role === 'super_admin' && adminItem.username === 'superadmin') {
      return res.status(400).json({ success: false, error: 'Cannot delete primary System Super Admin account.' });
    }

    await Staff.deleteOne({ id });
    await logActivity('Super Admin', 'Super Admin', 'Admin Removed', `Removed admin account ${adminItem.username} (${adminItem.department})`);

    res.json({ success: true, message: `Admin ${adminItem.name} removed successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/settings — System Settings ────────────────────────────────
router.get('/settings', async (_req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global_settings' }).lean();
    if (!settings) {
      settings = {
        categories: ['Hostel & Facilities', 'IT & Network', 'Finance & Scholarship', 'Sanitation & Hygiene', 'Academics', 'Harassment & Discipline'],
        departments: ['Facilities & HVAC', 'IT & Network Systems', 'Student Finance Bureau', 'Health & Sanitation', 'Academics Redressal', 'Internal Grievance Committee'],
        priorities: ['Low', 'Medium', 'High', 'Urgent'],
        slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
      };
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/auth/settings — Manage System Settings ──────────────────────────
router.put('/settings', async (req, res) => {
  try {
    const { categories, departments, priorities, slaHours } = req.body;

    let settings = await SystemSetting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new SystemSetting({ key: 'global_settings' });
    }

    if (categories) settings.categories = categories;
    if (departments) settings.departments = departments;
    if (priorities) settings.priorities = priorities;
    if (slaHours) settings.slaHours = slaHours;

    await settings.save();
    await logActivity('Super Admin', 'Super Admin', 'System Settings Updated', 'Updated complaint categories, departments, and SLA configurations.');

    res.json({ success: true, message: 'System settings updated successfully.', data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/activity-logs — System Audit Logs ────────────────────────
router.get('/activity-logs', async (_req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/stats — Scoped Statistics ────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { department } = req.query;
    let queryFilter = {};

    if (department && department !== 'all' && department !== 'All Departments') {
      queryFilter.department = department;
    }

    const tickets = await Ticket.find(queryFilter).lean();
    const requests = await SignupRequest.find().lean();
    const students = await User.find().lean();
    const admins = await Staff.find().lean();

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
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
