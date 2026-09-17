const express = require('express');
const router = express.Router();
const { Ticket, uuidv4, logActivity } = require('../db');

const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ── GET /api/tickets — Role-based Scoped Querying & Multi-Filtering ─────────────
router.get('/', async (req, res) => {
  try {
    const { role, department, regNo, category, status, priority, q } = req.query;
    let queryFilter = {};

    // 1. Role-based Scoping Guard
    if (role === 'dept_admin' && department) {
      queryFilter.department = department;
    } else if (role === 'student' && regNo) {
      const cleanRegNo = regNo.trim().toUpperCase();
      queryFilter.$or = [
        { 'complainant.regNo': { $regex: cleanRegNo, $options: 'i' } },
        { submittedBy: { $regex: cleanRegNo, $options: 'i' } }
      ];
    }

    // 2. Multi-Field Filter Criteria
    if (category && category !== 'all') {
      queryFilter.category = category;
    }
    if (department && department !== 'all' && role !== 'dept_admin') {
      queryFilter.department = department;
    }
    if (status && status !== 'all') {
      queryFilter.status = { $regex: `^${status}$`, $options: 'i' };
    }
    if (priority && priority !== 'all') {
      queryFilter.$or = [
        { urgency: { $regex: `^${priority}$`, $options: 'i' } },
        { priority: { $regex: `^${priority}$`, $options: 'i' } }
      ];
    }

    let tickets = await Ticket.find(queryFilter).sort({ createdAt: -1 }).lean();

    // 3. Text Search Query
    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      tickets = tickets.filter(t => 
        (t.id && t.id.toLowerCase().includes(query)) ||
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.complainant?.name && t.complainant.name.toLowerCase().includes(query)) ||
        (t.complainant?.regNo && t.complainant.regNo.toLowerCase().includes(query)) ||
        (t.location && t.location.toLowerCase().includes(query))
      );
    }

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/tickets/track/:id — Public tracking ───────────────────────────
router.get('/track/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ id: req.params.id }).lean();
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });
    
    res.json({
      success: true,
      data: {
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        department: ticket.department,
        status: ticket.status,
        urgency: ticket.urgency || ticket.priority,
        complainant: ticket.complainant,
        responseRemarks: ticket.responseRemarks || '',
        eta: ticket.eta,
        currentStepIndex: ticket.currentStepIndex,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        auditLogs: ticket.auditLogs || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/tickets/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ id: req.params.id }).lean();
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets — Submit Complaint (Auto-captures Authenticated Student Identity) ──
router.post('/', async (req, res) => {
  try {
    const {
      title,
      category,
      department: reqDept,
      urgency = 'medium',
      location = '',
      description = '',
      attachments = [],
      studentRegNo,
      studentName,
      studentEmail,
      studentDept
    } = req.body;

    if (!description || !category) {
      return res.status(400).json({ success: false, error: 'Category and description are required' });
    }

    const regNoClean = (studentRegNo || '241FA07001').toUpperCase();
    const nameClean = studentName || `Student ${regNoClean}`;
    const emailClean = studentEmail || `${regNoClean.toLowerCase()}@campus.edu`;

    const deptMap = {
      'Hostel & Facilities': 'Facilities & HVAC',
      'IT & Network': 'IT & Network Systems',
      'Finance & Scholarship': 'Student Finance Bureau',
      'Sanitation & Hygiene': 'Health & Sanitation',
      'Academics': 'Academics Redressal',
      'Harassment & Discipline': 'Internal Grievance Committee'
    };

    const assignedDepartment = reqDept || deptMap[category] || 'General Campus Affairs';
    const etaMap = { critical: 120, urgent: 120, high: 240, medium: 480, low: 960 };
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `RP-${randNum}`;
    const timestamp = `${today()}, ${now()}`;

    const titleExtract = title || (description.length > 55 ? description.substring(0, 52) + '...' : description);

    const newTicket = new Ticket({
      id: newId,
      title: titleExtract,
      category,
      department: assignedDepartment,
      urgency: urgency.toLowerCase(),
      priority: urgency.toLowerCase() === 'critical' ? 'Urgent' : 'Medium',
      status: 'new',
      slaStatus: urgency.toLowerCase() === 'critical' ? 'warning' : 'normal',
      location: location || 'Main Campus',
      description,
      complainant: {
        regNo: regNoClean,
        name: nameClean,
        email: emailClean,
        role: 'Student',
        department: studentDept || 'Engineering'
      },
      submittedBy: `Reg No: ${regNoClean} (${emailClean})`,
      assignedAgent: null,
      responseRemarks: '',
      eta: 'Assessing ETA...',
      etaMinutesLeft: etaMap[urgency.toLowerCase()] || 480,
      currentStepIndex: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      attachments: (attachments || []).map(a => ({ id: uuidv4(), name: a.name, size: a.size || '1.2 MB', type: a.type || 'file' })),
      auditLogs: [{
        id: uuidv4(),
        timestamp: now(),
        author: `Student ${regNoClean}`,
        role: 'Student',
        action: 'Complaint Logged',
        note: `Registered with ${urgency.toUpperCase()} priority.`
      }]
    });

    await newTicket.save();
    await logActivity(`Student ${regNoClean}`, 'Student', 'Complaint Submitted', `Submitted Complaint ID: ${newId} (${category})`);

    res.status(201).json({ success: true, message: `Complaint ${newId} submitted successfully!`, data: newTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/tickets/:id/status — Status & Response/Remarks Update ───────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, responseRemarks, updatedBy = 'Admin', role = 'Admin' } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

    const curTicket = await Ticket.findOne({ id: req.params.id });
    if (!curTicket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const normalizedStatus = status.toLowerCase();
    const stepMap = {
      new: 0, submitted: 0,
      investigating: 1, 'under review': 1,
      dispatched: 2, 'in progress': 2,
      resolved: 3,
      rejected: 3
    };

    const actionMap = {
      new: 'Re-queued to New Intake',
      submitted: 'Re-queued to Intake',
      investigating: 'Investigation Initiated',
      'under review': 'Under Department Review',
      dispatched: 'Technician Dispatched On-Site',
      'in progress': 'Field Action In Progress',
      resolved: 'Issue Verified & Resolved',
      rejected: 'Complaint Reviewed & Rejected'
    };

    const remarks = responseRemarks || (normalizedStatus === 'rejected' ? 'Complaint rejected after official verification.' : `Status updated to ${status}.`);

    const newLog = {
      id: uuidv4(),
      timestamp: now(),
      author: updatedBy,
      role: role,
      action: actionMap[normalizedStatus] || `Status -> ${status}`,
      note: remarks
    };

    curTicket.status = normalizedStatus;
    curTicket.currentStepIndex = stepMap[normalizedStatus] !== undefined ? stepMap[normalizedStatus] : 1;
    curTicket.responseRemarks = remarks;
    curTicket.updatedAt = `${today()}, ${now()}`;
    curTicket.auditLogs.unshift(newLog);

    await curTicket.save();
    await logActivity(updatedBy, role, `Complaint Status -> ${normalizedStatus.toUpperCase()}`, `Updated Complaint ID ${curTicket.id}. Remarks: ${remarks}`);

    res.json({ success: true, message: `Status updated to ${normalizedStatus}`, data: curTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/tickets/:id/assign — Assign Department/Technician ───────────
router.patch('/:id/assign', async (req, res) => {
  try {
    const { agentName, role: agentRole, department, updatedBy = 'Super Admin' } = req.body;
    const curTicket = await Ticket.findOne({ id: req.params.id });
    if (!curTicket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const newLog = {
      id: uuidv4(),
      timestamp: now(),
      author: updatedBy,
      role: 'Admin Dispatch',
      action: 'Technician / Dept Assigned',
      note: `Assigned to ${agentName} (${agentRole || 'Department Staff'}) [Dept: ${department || curTicket.department}]`
    };

    curTicket.assignedAgent = { name: agentName, role: agentRole || 'Staff Specialist', department: department || curTicket.department };
    curTicket.department = department || curTicket.department;
    curTicket.status = curTicket.status === 'new' ? 'investigating' : curTicket.status;
    curTicket.currentStepIndex = Math.max(curTicket.currentStepIndex || 0, 1);
    curTicket.updatedAt = `${today()}, ${now()}`;
    curTicket.auditLogs.unshift(newLog);

    await curTicket.save();
    await logActivity(updatedBy, 'Admin', 'Complaint Assigned', `Assigned Complaint ${curTicket.id} to ${agentName} (${department || curTicket.department})`);

    res.json({ success: true, message: `Complaint assigned to ${agentName}`, data: curTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/:id/notes — Add Remarks or Internal Notes ─────────────
router.post('/:id/notes', async (req, res) => {
  try {
    const { note, author = 'Staff Officer', role = 'Department Admin' } = req.body;
    if (!note?.trim()) return res.status(400).json({ success: false, error: 'Note is required' });

    const curTicket = await Ticket.findOne({ id: req.params.id });
    if (!curTicket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const newLog = {
      id: uuidv4(),
      timestamp: now(),
      author,
      role,
      action: 'Response Remarks Added',
      note
    };

    curTicket.responseRemarks = note;
    curTicket.updatedAt = `${today()}, ${now()}`;
    curTicket.auditLogs.unshift(newLog);

    await curTicket.save();
    await logActivity(author, role, 'Remarks Added', `Added response remarks for Complaint ${curTicket.id}: ${note}`);

    res.json({ success: true, message: 'Remarks saved', data: curTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
