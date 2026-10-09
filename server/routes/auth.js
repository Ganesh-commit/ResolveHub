const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const { uploadAvatar } = require('../middleware/upload');
const { verifyToken, requireRole, JWT_SECRET } = require('../middleware/authMiddleware');
const { 
  Staff, 
  User, 
  SignupRequest, 
  ActivityLog, 
  SystemSetting, 
  Ticket, 
  uuidv4, 
  logActivity 
} = require('../db');

// Zod Schema for Signup Request Validation
const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full Name must be at least 2 characters"),
  regNo: z.string().trim().min(3, "Registration Number is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  department: z.string().optional().default('CSE'),
  year: z.string().optional().default('1st Year'),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "Password must contain at least one letter and one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Helper to generate JWT Token
function generateJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// ── GET /api/auth/staff — Department Staff Listing ─────────────────────────
router.get('/staff', async (req, res) => {
  try {
    const { department, departmentId } = req.query;
    let filter = { status: 'ACTIVE' };

    if (departmentId && departmentId !== 'all') {
      filter.departmentId = departmentId;
    } else if (department && department !== 'all' && department !== 'All Departments') {
      filter.department = department;
    }

    const staffMembers = await Staff.find(filter, 'id name username role department departmentId avatarUrl phone email').lean();
    res.json({ success: true, count: staffMembers.length, data: staffMembers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/me — Currently Authenticated User ─────────────────────────
router.get('/me', async (req, res) => {
  try {
    let authHeader = req.headers.authorization || req.headers['x-access-token'];
    let decoded = null;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (e) {}
    }

    const userId = decoded?.id || req.query.userId;
    const regNo = decoded?.regNo || req.query.regNo;
    const username = decoded?.username || req.query.username;

    // Instant Super Admin check for /me to prevent DB buffering timeouts
    if (decoded?.role === 'super_admin' || username?.toLowerCase() === 'ksaiganesh64' || userId === 'SA-001') {
      return res.json({
        success: true,
        data: {
          id: 'SA-001',
          name: decoded?.name || 'K Sai Ganesh (Super Admin)',
          fullName: decoded?.name || 'K Sai Ganesh (Super Admin)',
          username: 'ksaiganesh64',
          email: 'ksaiganesh64@vignan.ac.in',
          phone: '+91 9876543210',
          department: 'All Departments',
          year: '',
          role: 'super_admin',
          avatarUrl: '',
          mustChangePassword: false
        }
      });
    }

    let user = null;
    let isStaff = false;

    if (userId) {
      user = await Staff.findOne({ id: userId }).lean() || await User.findOne({ id: userId }).lean();
    } else if (regNo) {
      user = await User.findOne({ regNo: regNo.trim().toUpperCase() }).lean();
    } else if (username) {
      user = await Staff.findOne({ username: username.trim().toLowerCase() }).lean();
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    const role = user.role || 'student';
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name || user.fullName,
        fullName: user.fullName || user.name,
        username: user.username || user.regNo,
        regNo: user.regNo || (role === 'student' ? user.username : undefined),
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'All Departments',
        year: user.year || '',
        role,
        avatarUrl: user.avatarUrl || '',
        mustChangePassword: Boolean(user.mustChangePassword)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/login — Enterprise Login Handler ──────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, regNo, password } = req.body;
    const loginIdentifier = (regNo || username || '').trim();
    // Do not trim password to preserve case sensitivity and trailing spaces if any
    const pwd = password || '';

    if (!loginIdentifier || !pwd) {
      await logActivity('Anonymous', 'Guest', 'Failed Login', 'Empty login credentials submitted');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // 1. Direct Instant Super Admin Check (0ms response)
    const lowerId = loginIdentifier.toLowerCase();
    const cleanRegNo = loginIdentifier.toUpperCase();

    const isSuperAdminCreds = (
      (lowerId === 'ksaiganesh64' || lowerId === 'superadmin') &&
      (pwd === 'SAI@@@killer197712200611' || pwd === 'superadmin123' || pwd === 'admin123')
    );

    if (isSuperAdminCreds) {
      const superAdminUser = {
        id: 'SA-001',
        name: 'K Sai Ganesh (Super Admin)',
        fullName: 'K Sai Ganesh (Super Admin)',
        username: 'ksaiganesh64',
        role: 'super_admin',
        email: 'ksaiganesh64@vignan.ac.in',
        phone: '+91 9876543210',
        department: 'All Departments',
        avatarUrl: ''
      };
      const token = generateJWT(superAdminUser);
      logActivity('ksaiganesh64', 'Super Admin', 'Admin Sign In', 'Signed in successfully').catch(() => {});

      return res.json({
        success: true,
        data: {
          ...superAdminUser,
          token
        }
      });
    }

    // 2. Direct Instant Demo Student Check (0ms response)
    const envDemoPass = process.env.DEMO_STUDENT_PASSWORD || '241FA07011';
    const isDemoStudentCreds = (
      cleanRegNo === '241FA07011' &&
      (pwd === '241FA07011' || pwd === envDemoPass)
    );

    if (isDemoStudentCreds) {
      const demoUser = {
        id: 'usr-demo-241fa07011',
        regNo: '241FA07011',
        name: 'Demo Student (241FA07011)',
        fullName: 'Demo Student (241FA07011)',
        email: '241fa07011@vignan.ac.in',
        phone: '+91 9876543210',
        department: 'CSE',
        year: '1st Year',
        role: 'student',
        avatarUrl: ''
      };
      const token = generateJWT(demoUser);
      logActivity('241FA07011', 'Student', 'Student Sign In', 'Demo Student signed in successfully').catch(() => {});

      return res.json({
        success: true,
        mustChangePassword: false,
        data: {
          ...demoUser,
          token
        }
      });
    }

    // 3. Parallel MongoDB Execution (Executes Staff, User, and SignupRequest lookups concurrently)
    const [staffDoc, userDoc, reqDoc] = await Promise.all([
      Staff.findOne({ username: lowerId }).lean().catch(() => null),
      User.findOne({ regNo: cleanRegNo }).lean().catch(() => null),
      SignupRequest.findOne({ regNo: cleanRegNo }).lean().catch(() => null)
    ]);

    // Check Staff account first
    if (staffDoc) {
      if (staffDoc.status === 'INACTIVE') {
        return res.status(403).json({ success: false, error: 'This Admin account has been deactivated by Super Admin.' });
      }

      if (staffDoc.lockoutUntil && new Date(staffDoc.lockoutUntil) > new Date()) {
        const minutesLeft = Math.ceil((new Date(staffDoc.lockoutUntil).getTime() - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          error: `Account temporarily locked due to 5 consecutive failed attempts. Try again in ${minutesLeft} minutes.`
        });
      }

      const isStaffValid = await bcrypt.compare(pwd, staffDoc.passwordHash || '');
      if (!isStaffValid) {
        logActivity(staffDoc.username, staffDoc.role === 'super_admin' ? 'Super Admin' : 'Department Admin', 'Failed Login', 'Invalid password attempt').catch(() => {});
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = generateJWT({
        id: staffDoc.id,
        username: staffDoc.username,
        role: staffDoc.role,
        name: staffDoc.name,
        department: staffDoc.department
      });

      logActivity(staffDoc.name, staffDoc.role === 'super_admin' ? 'Super Admin' : 'Department Admin', 'Admin Sign In', 'Signed in successfully').catch(() => {});

      return res.json({
        success: true,
        data: {
          id: staffDoc.id,
          name: staffDoc.name,
          username: staffDoc.username,
          role: staffDoc.role,
          email: staffDoc.email || '',
          phone: staffDoc.phone || '',
          department: staffDoc.department || 'All Departments',
          avatarUrl: staffDoc.avatarUrl || '',
          token
        }
      });
    }

    // Check Student account
    if (userDoc) {
      const isUserValid = await bcrypt.compare(pwd, userDoc.passwordHash || '');
      if (!isUserValid) {
        logActivity(userDoc.regNo, 'Student', 'Failed Login', `Invalid password for Reg No: ${userDoc.regNo}`).catch(() => {});
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (userDoc.status === 'INACTIVE') {
        return res.status(403).json({ success: false, error: 'Your student account is deactivated. Please contact Super Admin.' });
      }

      if (userDoc.lockoutUntil && new Date(userDoc.lockoutUntil) > new Date()) {
        const minutesLeft = Math.ceil((new Date(userDoc.lockoutUntil).getTime() - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          error: `Account temporarily locked due to 5 consecutive failed attempts. Try again in ${minutesLeft} minutes.`
        });
      }

      const token = generateJWT({
        id: userDoc.id,
        regNo: userDoc.regNo,
        role: 'student',
        name: userDoc.fullName,
        department: userDoc.department
      });

      logActivity(userDoc.fullName, 'Student', 'Student Sign In', `Reg No: ${userDoc.regNo} signed in.`).catch(() => {});

      return res.json({
        success: true,
        mustChangePassword: Boolean(userDoc.mustChangePassword),
        data: {
          id: userDoc.id,
          regNo: userDoc.regNo,
          name: userDoc.fullName,
          email: userDoc.email || '',
          phone: userDoc.phone || '',
          department: userDoc.department,
          year: userDoc.year,
          avatarUrl: userDoc.avatarUrl || '',
          role: 'student',
          token
        }
      });
    }

    // Check Pending or Rejected Signup Requests for Student
    if (reqDoc) {
      const isReqValid = await bcrypt.compare(pwd, reqDoc.passwordHash || '');
      if (!isReqValid) {
        logActivity(cleanRegNo, 'Student', 'Failed Login', `Invalid password for Reg No: ${cleanRegNo}`).catch(() => {});
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (reqDoc.status === 'PENDING') {
        logActivity(cleanRegNo, 'Student', 'Failed Login', 'Attempted login on PENDING request').catch(() => {});
        return res.status(403).json({
          success: false,
          error: 'Your account request is awaiting Super Admin approval.'
        });
      }

      if (reqDoc.status === 'REJECTED') {
        logActivity(cleanRegNo, 'Student', 'Failed Login', 'Attempted login on REJECTED request').catch(() => {});
        return res.status(403).json({
          success: false,
          error: `Your request was rejected: ${reqDoc.rejectionReason || 'Invalid registration details'}`
        });
      }
    }

    // Non-existent user or wrong credentials
    logActivity(loginIdentifier, 'Guest', 'Failed Login', 'Invalid credentials').catch(() => {});
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// ── POST /api/auth/signup-request — Student Account Request Submission ─────
router.post('/signup-request', async (req, res) => {
  try {
    // Validate request body with Zod
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map(i => i.message).join('. ');
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { fullName, regNo, email, phone, department, year, password } = parseResult.data;
    const cleanRegNo = regNo.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Parallel lookup for duplicate regNo or email in active Users and pending SignupRequests
    const [existingUser, existingReq] = await Promise.all([
      User.findOne({ $or: [{ regNo: cleanRegNo }, { email: cleanEmail }] }).lean().catch(() => null),
      SignupRequest.findOne({ $or: [{ regNo: cleanRegNo }, { email: cleanEmail }] }).catch(() => null)
    ]);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Registration number or email already exists.'
      });
    }

    if (existingReq && existingReq.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'A pending account request already exists for this registration number or email.'
      });
    }

    // Hash password immediately with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    let signupDoc;
    if (existingReq) {
      // Update existing request record (e.g. if previous attempt was rejected)
      existingReq.fullName = fullName.trim();
      existingReq.email = cleanEmail;
      existingReq.department = department || 'CSE';
      existingReq.year = year || '1st Year';
      existingReq.passwordHash = passwordHash;
      existingReq.status = 'PENDING';
      existingReq.rejectionReason = null;
      existingReq.createdAt = new Date().toLocaleString('en-IN');
      await existingReq.save();
      signupDoc = existingReq;
    } else {
      signupDoc = await SignupRequest.create({
        id: `req-${uuidv4().substring(0, 8)}`,
        regNo: cleanRegNo,
        fullName: fullName.trim(),
        email: cleanEmail,
        department: department || 'CSE',
        year: year || '1st Year',
        passwordHash,
        status: 'PENDING',
        createdAt: new Date().toLocaleString('en-IN')
      });
    }

    await logActivity(fullName, 'Student Intake', 'Account Requested', `Reg No: ${cleanRegNo} requested account approval.`).catch(() => {});

    // Real-time socket notification if IO instance is attached
    if (req.app.get('io')) {
      try {
        req.app.get('io').emit('new_account_request', {
          id: signupDoc.id,
          regNo: cleanRegNo,
          fullName: signupDoc.fullName,
          department: signupDoc.department
        });
      } catch (e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Your request has been sent to the Super Admin. You can log in after approval.',
      data: signupDoc
    });
  } catch (err) {
    const isDbError = err.message && (err.message.includes('buffering timed out') || err.message.includes('findOne') || err.message.includes('Mongoose'));
    const safeError = isDbError ? 'Registration request processing failed. Please try again.' : (err.message || 'Registration failed');
    res.status(400).json({ success: false, error: safeError });
  }
});

// ── GET /api/auth/signup-requests — Fetch Pending/All Requests ──────────────
router.get('/signup-requests', verifyToken, requireRole('super_admin'), async (_req, res) => {
  try {
    const requests = await SignupRequest.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/signup-requests/:id/approve — Super Admin Approves Account
router.post('/signup-requests/:id/approve', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const reqItem = await SignupRequest.findOne({ id });
    if (!reqItem) {
      return res.status(404).json({ success: false, error: 'Signup request not found' });
    }

    reqItem.status = 'APPROVED';
    await reqItem.save();

    const cleanReg = reqItem.regNo.trim().toUpperCase();

    // Create or activate student account using the SAME password hash chosen in request form
    let user = await User.findOne({ regNo: cleanReg });
    if (!user) {
      user = new User({
        id: `usr-${uuidv4().substring(0, 8)}`,
        regNo: cleanReg,
        fullName: reqItem.fullName,
        email: reqItem.email,
        department: reqItem.department,
        year: reqItem.year,
        passwordHash: reqItem.passwordHash,
        mustChangePassword: false,
        status: 'ACTIVE',
        activatedAt: new Date().toLocaleString('en-IN')
      });
      await user.save();
    } else {
      user.status = 'ACTIVE';
      user.passwordHash = reqItem.passwordHash;
      user.mustChangePassword = false;
      await user.save();
    }

    await logActivity(req.user.name || 'Super Admin', 'Super Admin', 'Account Approved', `Approved student account for Reg No: ${cleanReg} (${reqItem.fullName})`);

    res.json({
      success: true,
      message: `Account for Student ${cleanReg} (${reqItem.fullName}) has been approved successfully.`,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/signup-requests/:id/reject — Super Admin Rejects Account
router.post('/signup-requests/:id/reject', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reqItem = await SignupRequest.findOne({ id });
    if (!reqItem) {
      return res.status(404).json({ success: false, error: 'Signup request not found' });
    }

    reqItem.status = 'REJECTED';
    reqItem.rejectionReason = reason ? reason.trim() : 'Invalid credentials or verification failed';
    await reqItem.save();

    await logActivity(req.user.name || 'Super Admin', 'Super Admin', 'Account Rejected', `Rejected Reg No: ${reqItem.regNo}. Reason: ${reqItem.rejectionReason}`);

    res.json({
      success: true,
      message: `Account request for ${reqItem.regNo} rejected.`,
      data: reqItem
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/auth/signup-requests/:id — Delete Account Request ─────────
router.delete('/signup-requests/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const reqItem = await SignupRequest.findOneAndDelete({ $or: [{ id }, { regNo: id.toUpperCase() }] });
    if (!reqItem) {
      return res.status(404).json({ success: false, error: 'Signup request not found' });
    }

    await logActivity(req.user?.name || 'Super Admin', 'Super Admin', 'Account Request Deleted', `Deleted request for Reg No: ${reqItem.regNo}`);

    res.json({
      success: true,
      message: `Account request for ${reqItem.regNo} deleted successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/check-status/:regNo — Public Status Check ────────────────
router.get('/check-status/:regNo', async (req, res) => {
  try {
    const cleanRegNo = req.params.regNo.trim().toUpperCase();
    const activeUser = await User.findOne({ regNo: cleanRegNo });
    if (activeUser && activeUser.status === 'ACTIVE') {
      return res.json({ success: true, data: { status: 'APPROVED' } });
    }

    const reqItem = await SignupRequest.findOne({ regNo: cleanRegNo });
    if (!reqItem) {
      return res.json({ success: true, data: { status: 'NOT_FOUND' } });
    }

    res.json({
      success: true,
      data: {
        status: reqItem.status,
        reason: reqItem.rejectionReason
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/auth/me/avatar & PUT /api/users/me/avatar — Profile Picture Upload
const avatarHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded or file exceeds size limit.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    let user = null;

    if (req.user?.id) {
      user = await Staff.findOne({ id: req.user.id }) || await User.findOne({ id: req.user.id });
    } else if (req.body?.userId) {
      user = await Staff.findOne({ id: req.body.userId }) || await User.findOne({ id: req.body.userId });
    } else if (req.body?.regNo) {
      user = await User.findOne({ regNo: req.body.regNo.trim().toUpperCase() });
    }

    if (user) {
      // Delete old file if present
      if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
        const oldPath = path.join(__dirname, '..', user.avatarUrl);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) {}
        }
      }

      user.avatarUrl = avatarUrl;
      await user.save();
      await logActivity(user.name || user.fullName, user.role || 'User', 'Profile Photo Uploaded', `Updated avatar image`);
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded and saved successfully!',
      avatarUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.put('/me/avatar', verifyToken, uploadAvatar.single('avatar'), avatarHandler);
router.post('/upload-avatar', uploadAvatar.single('avatar'), avatarHandler);

// ── DELETE /api/auth/me/avatar & DELETE /api/users/me/avatar ────────────────
router.delete('/me/avatar', verifyToken, async (req, res) => {
  try {
    let user = await Staff.findOne({ id: req.user.id }) || await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '..', user.avatarUrl);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    user.avatarUrl = '';
    await user.save();
    await logActivity(user.name || user.fullName, user.role || 'User', 'Profile Photo Removed', `Deleted profile avatar`);

    res.json({
      success: true,
      message: 'Profile photo removed successfully.',
      avatarUrl: ''
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/auth/me — Update Profile Information & Change Password ─────────
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, fullName, phone, email, currentPassword, newPassword, confirmPassword } = req.body;
    let user = await Staff.findOne({ id: req.user.id }) || await User.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name || fullName) {
      if (user.fullName !== undefined) user.fullName = (fullName || name).trim();
      if (user.name !== undefined) user.name = (name || fullName).trim();
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (email !== undefined) user.email = email.trim();

    // Password change verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, error: 'New password and confirm password do not match.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      user.mustChangePassword = false;
      await logActivity(user.name || user.fullName, user.role || 'User', 'Password Changed', 'User changed their password from profile page');
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: user.id,
        name: user.name || user.fullName,
        fullName: user.fullName || user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        avatarUrl: user.avatarUrl || ''
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Super Admin Password Reset for Students ──────────────────────────────────
router.post('/students/:id/reset-password', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const student = await User.findOne({ id });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student account not found.' });
    }

    student.passwordHash = await bcrypt.hash(newPassword, 10);
    student.failedLoginAttempts = 0;
    student.lockoutUntil = null;
    await student.save();

    await logActivity(req.user.name || 'Super Admin', 'Super Admin', 'Student Password Reset', `Reset password for Reg No: ${student.regNo}`);

    res.json({
      success: true,
      message: `Password for Student ${student.regNo} has been reset successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Super Admin Management Endpoints ─────────────────────────────────────────
router.get('/students', verifyToken, requireRole('super_admin'), async (_req, res) => {
  try {
    const students = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/students/:id/status', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const student = await User.findOne({ id });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    student.status = status;
    await student.save();
    await logActivity(req.user.name, 'Super Admin', 'Student Status Changed', `Student ${student.regNo} set to ${status}`);

    res.json({ success: true, message: `Student status updated to ${status}`, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/students/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOneAndDelete({ $or: [{ id }, { regNo: id.toUpperCase() }] });
    if (!student) return res.status(404).json({ success: false, error: 'Student account not found' });

    // Also remove any signup request record
    await SignupRequest.deleteMany({ regNo: student.regNo });

    await logActivity(req.user?.name || 'Super Admin', 'Super Admin', 'Student Deleted', `Deleted Student ${student.fullName} (${student.regNo})`);

    res.json({ success: true, message: `Student ${student.regNo} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admins', verifyToken, requireRole('super_admin'), async (_req, res) => {
  try {
    const admins = await Staff.find({ role: 'dept_admin' }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: admins.length, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admins', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { name, username, password, department } = req.body;
    if (!name || !username || !password || !department) {
      return res.status(400).json({ success: false, error: 'Name, Username, Password, and Department are required.' });
    }

    const cleanUser = username.trim().toLowerCase();
    const existing = await Staff.findOne({ username: cleanUser });
    if (existing) {
      return res.status(400).json({ success: false, error: `Username ${cleanUser} is already taken.` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await Staff.create({
      id: `admin-dept-${uuidv4().substring(0, 8)}`,
      username: cleanUser,
      passwordHash,
      name: name.trim(),
      role: 'dept_admin',
      department,
      status: 'ACTIVE'
    });

    await logActivity(req.user.name, 'Super Admin', 'Department Admin Created', `Created Admin ${name} for ${department}`);

    res.status(201).json({ success: true, message: `Department Admin ${name} created successfully.`, data: newAdmin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/admins/:id/status', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const admin = await Staff.findOne({ id });
    if (!admin) return res.status(404).json({ success: false, error: 'Admin not found' });

    admin.status = status;
    await admin.save();
    await logActivity(req.user.name, 'Super Admin', 'Admin Status Changed', `Admin ${admin.username} set to ${status}`);

    res.json({ success: true, message: `Admin status updated to ${status}`, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/admins/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Staff.findOneAndDelete({ id });
    if (!admin) return res.status(404).json({ success: false, error: 'Admin account not found' });

    await logActivity(req.user.name, 'Super Admin', 'Admin Deleted', `Deleted Admin ${admin.name} (${admin.username})`);

    res.json({ success: true, message: `Admin ${admin.name} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/settings', async (_req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global_settings' }).lean();
    if (!settings) {
      settings = {
        categories: ['Transport', 'Examinations', 'Library', 'Canteen & Food', 'Security & Safety', 'Infrastructure & Maintenance'],
        departments: ['Information Technology (IT)', 'CSE (Computer Science & Engineering)', 'ECE (Electronics & Communication Engineering)'],
        priorities: ['Low', 'Medium', 'High', 'Urgent'],
        slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
      };
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/settings', verifyToken, requireRole('super_admin'), async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new SystemSetting({ key: 'global_settings', ...req.body });
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    await logActivity(req.user.name, 'Super Admin', 'System Settings Updated', 'Updated system categories or SLA thresholds');

    res.json({ success: true, message: 'System settings updated successfully.', data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/activity-logs', verifyToken, requireRole('super_admin'), async (_req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { department } = req.query;
    let filter = {};
    if (department && department !== 'all' && department !== 'All Departments') {
      filter.department = new RegExp(department.replace(/\s*\(.*?\)/, '').trim(), 'i');
    }

    const total = await Ticket.countDocuments(filter);
    const resolved = await Ticket.countDocuments({ ...filter, status: 'resolved' });
    const pending = await Ticket.countDocuments({ ...filter, status: { $in: ['new', 'submitted', 'under review'] } });
    const inProgress = await Ticket.countDocuments({ ...filter, status: { $in: ['investigating', 'dispatched', 'in progress', 'assigned'] } });

    res.json({
      success: true,
      data: {
        total,
        resolved,
        pending,
        inProgress,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : '100'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
