const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Ticket, User, uuidv4, logActivity } = require('../db');
const { uploadAttachments } = require('../middleware/uploadAttachment');
const { analyzeGrievanceText, checkDuplicateCluster } = require('../services/aiCategorizerService');
const { smartRouteGrievance, getDepartmentRegexForHOD } = require('../services/smartRoutingService');

const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ── GET /api/tickets — Role-based Scoped Querying & Multi-Filtering ─────────────
router.get('/', async (req, res) => {
  try {
    const { role, department, username, regNo, category, status, priority, q } = req.query;
    let queryFilter = {};

    // 1. Role-based Scoping Guard
    if (role === 'dept_admin' && (department || username)) {
      const deptRegex = getDepartmentRegexForHOD(department || '', username || '');
      queryFilter.department = { $regex: deptRegex };
      queryFilter.isRetainedBySuperAdmin = { $ne: true };
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

    // Ensure submittedAt is always populated alongside createdAt for frontend tables
    tickets = tickets.map(t => ({
      ...t,
      submittedAt: t.submittedAt || t.createdAt
    }));

    // Mask student identity if isAnonymous is true and requesting user is staff/dept_admin
    if (role === 'dept_admin') {
      tickets = tickets.map(t => {
        if (t.isAnonymous) {
          return {
            ...t,
            complainant: {
              name: 'Anonymous Student (Identity Shielded)',
              regNo: 'MASKED-XXXX',
              email: 'confidential@campus.edu',
              role: 'Student'
            },
            submittedBy: 'Confidential Anonymous Submission'
          };
        }
        return t;
      });
    }

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

// ── GET /api/tickets/analytics/heatmap — Campus-Wide Location Heatmap ───────
router.get('/analytics/heatmap', async (req, res) => {
  try {
    const { category, status, startDate, endDate } = req.query;
    const { CAMPUS_LOCATIONS, LOCATION_ZONES } = require('../data/campusLocations');

    let queryFilter = {};

    if (category && category !== 'all') {
      queryFilter.category = category;
    }

    if (status && status !== 'all') {
      queryFilter.status = { $regex: `^${status}$`, $options: 'i' };
    }

    if (startDate || endDate) {
      queryFilter.createdAt = {};
      if (startDate) queryFilter.createdAt.$gte = startDate;
      if (endDate) queryFilter.createdAt.$lte = endDate;
    }

    const tickets = await Ticket.find(queryFilter).lean();

    // 1. Zone-Level Aggregation
    const zoneCounts = {};
    LOCATION_ZONES.forEach(z => { zoneCounts[z] = 0; });

    // 2. Individual Location Aggregation
    const locationStatsMap = {};
    CAMPUS_LOCATIONS.forEach(loc => {
      locationStatsMap[loc.id] = {
        id: loc.id,
        name: loc.name,
        zone: loc.zone,
        type: loc.type,
        count: 0,
        categories: {}
      };
    });

    tickets.forEach(t => {
      // Resolve location ID or fallback to matching by location name / hostel block
      let matchedLoc = null;
      if (t.locationId && locationStatsMap[t.locationId]) {
        matchedLoc = locationStatsMap[t.locationId];
      } else {
        const textToMatch = `${t.location || ''} ${t.hostelBlock || ''}`.toLowerCase();
        matchedLoc = CAMPUS_LOCATIONS.find(l => textToMatch.includes(l.name.toLowerCase()));
      }

      if (matchedLoc) {
        matchedLoc.count++;
        zoneCounts[matchedLoc.zone] = (zoneCounts[matchedLoc.zone] || 0) + 1;
        const cat = t.category || 'General';
        matchedLoc.categories[cat] = (matchedLoc.categories[cat] || 0) + 1;
      } else {
        // Fallback to "Online / No location" or General Common Areas
        zoneCounts['Online / No location'] = (zoneCounts['Online / No location'] || 0) + 1;
      }
    });

    const locationList = Object.values(locationStatsMap).map(loc => {
      let intensity = 'green';
      if (loc.count >= 5) intensity = 'rose';
      else if (loc.count >= 2) intensity = 'amber';

      return { ...loc, intensity };
    });

    // 3. Top 5 Hotspots
    const topHotspots = [...locationList]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Location-by-Category Matrix
    const categories = ['Hostel & Facilities', 'IT & Network', 'Finance & Scholarship', 'Sanitation & Hygiene', 'Academics', 'Harassment & Discipline'];
    const matrix = locationList.map(loc => {
      const row = { id: loc.id, locationName: loc.name, zone: loc.zone, total: loc.count };
      categories.forEach(cat => {
        row[cat] = loc.categories[cat] || 0;
      });
      return row;
    });

    res.json({
      success: true,
      data: {
        totalTickets: tickets.length,
        zoneCounts,
        locationList,
        topHotspots,
        matrix
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/ai-classify — AI Recommendation Engine ─────────────────
router.post('/ai-classify', async (req, res) => {
  try {
    const { text, category, location, hostelBlock } = req.body;
    const aiResult = analyzeGrievanceText(text || '');
    const duplicateCheck = await checkDuplicateCluster(category || aiResult.category, hostelBlock || aiResult.hostelBlock, location);

    res.json({
      success: true,
      aiSuggestion: aiResult,
      duplicateCheck
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/tickets/track/:id — Public tracking ───────────────────────────
router.get('/track/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ id: req.params.id }).lean();
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });
    
    // Mask identity if anonymous
    const displayComplainant = ticket.isAnonymous ? {
      name: 'Anonymous Student (Shielded)',
      regNo: 'CONFIDENTIAL',
      email: 'anonymous@campus.edu'
    } : ticket.complainant;

    res.json({
      success: true,
      data: {
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        department: ticket.department,
        status: ticket.status,
        urgency: ticket.urgency || ticket.priority,
        complainant: displayComplainant,
        isAnonymous: ticket.isAnonymous,
        hostelBlock: ticket.hostelBlock,
        responseRemarks: ticket.responseRemarks || '',
        eta: ticket.eta,
        slaDeadline: ticket.slaDeadline,
        escalationLevel: ticket.escalationLevel,
        escalationReason: ticket.escalationReason,
        rating: ticket.rating,
        ratingFeedback: ticket.ratingFeedback,
        isReopened: ticket.isReopened,
        reopenReason: ticket.reopenReason,
        attachments: ticket.attachments || [],
        timeline: ticket.timeline || [],
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

// ── POST /api/tickets — Submit Complaint (Supports Attachments, Anonymous Mode & AI) ─────
router.post('/', (req, res, next) => {
  uploadAttachments.array('files', 5)(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      id: reqId,
      title,
      category,
      department: reqDept,
      urgency = 'medium',
      priority: reqPriority,
      location = '',
      locationId = null,
      zone = 'Online / No location',
      hostelBlock = 'General / Campus',
      description = '',
      isAnonymous = false,
      attachments = [],
      studentRegNo,
      studentName,
      studentEmail,
      studentDept
    } = req.body;

    if (!description || !category) {
      return res.status(400).json({ success: false, error: 'Category and description are required' });
    }

    const regNoClean = (studentRegNo || '241FA07011').trim().toUpperCase();
    const dbStudent = await User.findOne({ regNo: regNoClean }).lean().catch(() => null);
    const nameClean = studentName || dbStudent?.fullName || dbStudent?.name || `Student ${regNoClean}`;
    const emailClean = studentEmail || dbStudent?.email || `${regNoClean.toLowerCase()}@vignan.ac.in`;
    const deptClean = studentDept || dbStudent?.department || 'Information Technology (IT)';

    const aiInfo = analyzeGrievanceText(description);
    const titleExtract = title || (description.length > 65 ? description.substring(0, 62) + '...' : description);

    const priorityNorm = reqPriority || (
      urgency.toLowerCase() === 'critical' || urgency.toLowerCase() === 'urgent' ? 'Urgent' :
      urgency.toLowerCase() === 'high' ? 'High' :
      urgency.toLowerCase() === 'low' ? 'Low' : 'Medium'
    );
    const urgencyNorm = (
      priorityNorm === 'Urgent' ? 'critical' :
      priorityNorm === 'High' ? 'high' :
      priorityNorm === 'Low' ? 'low' : 'medium'
    );

    // Run SuperAdmin Smart Triage & Department HOD Auto-Routing Engine
    const smartRouting = smartRouteGrievance({
      title: titleExtract,
      description,
      category,
      location,
      studentDept: deptClean,
      urgency: priorityNorm
    });

    const assignedDepartment = smartRouting.isRetainedBySuperAdmin
      ? 'SuperAdmin Executive Desk'
      : ((reqDept && reqDept !== 'Department Desk' && reqDept !== 'Campus Administration')
          ? reqDept
          : (smartRouting.targetDepartment || aiInfo.department || deptClean));

    const etaMap = { critical: 120, urgent: 120, high: 240, medium: 480, low: 960 };
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newId = reqId || `RP-${randNum}`;
    const timestamp = `${today()}, ${now()}`;
    const isoNow = new Date().toISOString();

    // Process Attachments (Multipart uploaded files or JSON array)
    let processedAttachments = [];

    if (req.files && req.files.length > 0) {
      processedAttachments = req.files.map(file => {
        const isImg = file.mimetype.startsWith('image/');
        const isPdf = file.mimetype.includes('pdf');
        return {
          id: `att-${uuidv4().substring(0, 8)}`,
          name: file.originalname,
          originalName: file.originalname,
          fileName: file.filename,
          url: `/uploads/attachments/${file.filename}`,
          mimeType: file.mimetype,
          type: isImg ? 'image' : (isPdf ? 'pdf' : 'doc'),
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          uploadedAt: timestamp
        };
      });
    } else if (attachments) {
      try {
        const parsed = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
        if (Array.isArray(parsed)) {
          processedAttachments = parsed.map(a => ({
            id: a.id || `att-${uuidv4().substring(0, 8)}`,
            name: a.name || a.originalName || 'Attachment',
            originalName: a.originalName || a.name || 'Attachment',
            fileName: a.fileName || '',
            url: a.url || (a.fileName ? `/uploads/attachments/${a.fileName}` : ''),
            mimeType: a.mimeType || a.type || 'file',
            type: a.type || (a.mimeType?.startsWith('image/') ? 'image' : 'file'),
            size: a.size || '1.0 MB',
            uploadedAt: a.uploadedAt || timestamp
          }));
        }
      } catch (e) {}
    }

    const newTicket = new Ticket({
      id: newId,
      title: titleExtract,
      category: category || aiInfo.category,
      department: assignedDepartment,
      urgency: urgencyNorm,
      priority: priorityNorm,
      status: req.body.status || 'Pending',
      slaStatus: urgencyNorm === 'critical' ? 'warning' : 'normal',
      isAnonymous: Boolean(isAnonymous),
      anonymousAlias: isAnonymous ? 'Anonymous Student (Shielded)' : undefined,
      locationId: locationId || null,
      zone: zone || 'Online / No location',
      hostelBlock: hostelBlock || aiInfo.hostelBlock,
      location: location || 'Main Campus',
      description,
      aiSuggestedCategory: aiInfo.category,
      aiSuggestedPriority: aiInfo.priority,
      aiSuggestedDept: smartRouting.targetDepartment || aiInfo.department,
      isRetainedBySuperAdmin: smartRouting.isRetainedBySuperAdmin,
      routingScope: smartRouting.routingScope,
      routingReason: smartRouting.routingReason,
      escalationLevel: smartRouting.escalationLevel,
      slaDeadline: new Date(Date.now() + (smartRouting.slaHours || 24) * 60 * 60 * 1000),
      complainant: {
        regNo: regNoClean,
        name: nameClean,
        email: emailClean,
        role: 'Student',
        department: deptClean
      },
      submittedBy: isAnonymous ? 'Confidential Anonymous Submission' : `${nameClean} (${regNoClean})`,
      assignedAgent: smartRouting.assignedHOD || null,
      assignedOfficer: smartRouting.assignedHOD?.name || 'Department Nodal Officer',
      responseRemarks: smartRouting.routingReason,
      eta: `${smartRouting.slaHours || 24} Hours (SLA Target)`,
      etaMinutesLeft: etaMap[urgencyNorm] || 480,
      submittedAt: timestamp,
      createdAt: timestamp,
      createdAtIso: isoNow,
      updatedAt: timestamp,
      attachments: processedAttachments,
      timeline: [
        {
          stepKey: 'submitted',
          title: 'Grievance Submitted',
          status: 'Submitted',
          timestamp,
          date: timestamp,
          note: `Logged by ${nameClean} (${regNoClean})`,
          completed: true
        },
        {
          stepKey: 'assigned',
          title: 'Smart Triage & HOD Routing',
          status: 'Assigned',
          timestamp,
          date: timestamp,
          note: smartRouting.routingReason,
          completed: false
        },
        {
          stepKey: 'in_progress',
          title: 'Field Action & Inspection',
          status: 'In Progress',
          timestamp: '',
          date: 'Scheduled',
          note: 'Awaiting field inspection',
          completed: false
        },
        {
          stepKey: 'resolved',
          title: 'Resolution Verified',
          status: 'Resolved',
          timestamp: '',
          date: 'Pending Completion',
          note: 'Awaiting final closure',
          completed: false
        }
      ],
      auditLogs: [
        {
          id: uuidv4(),
          timestamp: now(),
          author: 'SuperAdmin Smart Triage Engine',
          role: 'Automated Triage Bot',
          action: smartRouting.isRetainedBySuperAdmin ? 'Retained by SuperAdmin' : `Auto-Routed -> ${smartRouting.assignedHOD?.role || assignedDepartment}`,
          note: smartRouting.routingReason
        },
        {
          id: uuidv4(),
          timestamp: now(),
          author: isAnonymous ? 'Anonymous Student' : `${nameClean} (${regNoClean})`,
          role: 'Student',
          action: isAnonymous ? 'Anonymous Complaint Logged' : 'Complaint Logged',
          note: `Registered with ${priorityNorm} priority. ${isAnonymous ? '[Identity Shielded for Welfare]' : ''}`
        }
      ]
    });

    await newTicket.save();
    await logActivity(isAnonymous ? 'Anonymous Student' : `Student ${regNoClean}`, 'Student', 'Complaint Submitted', `Submitted Complaint ID: ${newId} (${category})`).catch(() => {});

    res.status(201).json({ success: true, message: `Complaint ${newId} submitted successfully!`, data: newTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/run-sla-escalation — Trigger SLA Escalation Check ─────
router.post('/run-sla-escalation', async (req, res) => {
  try {
    const { runSLAEscalationCheck } = require('../services/slaEscalationService');
    const result = await runSLAEscalationCheck();
    res.json({ success: true, message: `SLA Escalation worker executed. ${result.escalatedCount || 0} tickets escalated.`, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/smart-route-all — SuperAdmin Smart Triage Auto-Routing Engine ──
router.post('/smart-route-all', async (req, res) => {
  try {
    const tickets = await Ticket.find({
      status: { $in: ['Submitted', 'new', 'Assigned', 'Under Review'] }
    });

    let routedToHODCount = 0;
    let retainedBySuperAdminCount = 0;
    const timestamp = `${today()}, ${now()}`;

    for (const ticket of tickets) {
      const smartRouting = smartRouteGrievance({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        location: ticket.location,
        studentDept: ticket.complainant?.department || ticket.department,
        urgency: ticket.urgency || ticket.priority
      });

      ticket.department = smartRouting.isRetainedBySuperAdmin ? 'SuperAdmin Executive Desk' : smartRouting.targetDepartment;
      ticket.assignedAgent = smartRouting.assignedHOD;
      ticket.isRetainedBySuperAdmin = smartRouting.isRetainedBySuperAdmin;
      ticket.routingScope = smartRouting.routingScope;
      ticket.routingReason = smartRouting.routingReason;
      ticket.escalationLevel = smartRouting.escalationLevel;
      if (ticket.status === 'Submitted' || ticket.status === 'new') {
        ticket.status = smartRouting.isRetainedBySuperAdmin ? 'Under Review' : 'Assigned';
      }
      ticket.updatedAt = timestamp;

      ticket.auditLogs.unshift({
        id: uuidv4(),
        timestamp: now(),
        author: 'SuperAdmin Smart Triage Engine',
        role: 'Automated Triage Bot',
        action: smartRouting.isRetainedBySuperAdmin ? 'Retained by SuperAdmin' : `Auto-Routed -> ${smartRouting.assignedHOD.role}`,
        note: smartRouting.routingReason
      });

      await ticket.save();
      if (smartRouting.isRetainedBySuperAdmin) retainedBySuperAdminCount++;
      else routedToHODCount++;
    }

    res.json({
      success: true,
      message: `Smart Triage Complete: ${routedToHODCount} routed to Department HODs, ${retainedBySuperAdminCount} retained by SuperAdmin.`,
      data: { routedToHODCount, retainedBySuperAdminCount, totalProcessed: tickets.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/tickets/:id/smart-route — Route or Retain Single Ticket ─────
router.patch('/:id/smart-route', async (req, res) => {
  try {
    const { retainBySuperAdmin, department, reason } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const timestamp = `${today()}, ${now()}`;
    if (retainBySuperAdmin) {
      ticket.isRetainedBySuperAdmin = true;
      ticket.routingScope = 'SUPERADMIN_RETAINED';
      ticket.department = 'SuperAdmin Executive Desk';
      ticket.escalationLevel = 'LEVEL_2_DEAN';
      ticket.routingReason = reason || 'Retained by SuperAdmin for direct executive resolution.';
      ticket.assignedAgent = {
        name: 'System Super Admin (K Sai Ganesh)',
        role: 'Super Admin Executive Desk',
        department: 'All Departments'
      };
    } else {
      const smartRouting = smartRouteGrievance({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        location: ticket.location,
        studentDept: department || ticket.complainant?.department || ticket.department,
        urgency: ticket.urgency || ticket.priority
      });
      ticket.isRetainedBySuperAdmin = false;
      ticket.routingScope = 'DEPT_HOD_ROUTED';
      ticket.department = department || smartRouting.targetDepartment;
      ticket.assignedAgent = smartRouting.assignedHOD;
      ticket.routingReason = reason || smartRouting.routingReason;
      ticket.status = ticket.status === 'Submitted' || ticket.status === 'new' ? 'Assigned' : ticket.status;
    }

    ticket.updatedAt = timestamp;
    ticket.auditLogs.unshift({
      id: uuidv4(),
      timestamp: now(),
      author: 'Super Admin',
      role: 'Super Admin',
      action: ticket.isRetainedBySuperAdmin ? 'Retained by SuperAdmin' : `Smart Routed -> ${ticket.department}`,
      note: ticket.routingReason
    });

    await ticket.save();
    res.json({ success: true, message: ticket.routingReason, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/:id/resolve-with-proof — HOD Marks Resolved with Proof ─
router.post('/:id/resolve-with-proof', async (req, res) => {
  try {
    const { remarks, proofUrl = '', updatedBy = 'Department HOD' } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const timestamp = `${today()}, ${now()}`;
    const proofRemarks = remarks || 'Issue resolved with field inspection proof. Awaiting student two-way verification.';

    ticket.status = 'Pending Student Verification';
    ticket.responseRemarks = proofRemarks;
    ticket.updatedAt = timestamp;
    ticket.resolutionProof = {
      remarks: proofRemarks,
      proofUrl,
      resolvedByHOD: updatedBy,
      resolvedAt: timestamp,
      verifiedByStudent: false,
      studentVerifiedAt: ''
    };

    if (ticket.timeline) {
      const stepAssigned = ticket.timeline.find(t => t.stepKey === 'assigned');
      const stepProgress = ticket.timeline.find(t => t.stepKey === 'in_progress');
      if (stepAssigned) stepAssigned.completed = true;
      if (stepProgress) {
        stepProgress.completed = true;
        stepProgress.timestamp = new Date();
        stepProgress.note = proofRemarks;
      }
    }

    ticket.auditLogs.unshift({
      id: uuidv4(),
      timestamp: now(),
      author: updatedBy,
      role: 'Department HOD',
      action: 'Resolved with Proof -> Pending Student Verification',
      note: proofRemarks
    });

    await ticket.save();
    res.json({
      success: true,
      message: 'Ticket marked as Pending Student Verification with resolution proof.',
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/:id/verify-resolution — Student Two-Way Verification ───
router.post('/:id/verify-resolution', async (req, res) => {
  try {
    const { approved = true, rating = 5, feedback = '', reason = '' } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const timestamp = `${today()}, ${now()}`;
    const studentAuthor = ticket.isAnonymous ? 'Anonymous Student' : (ticket.complainant?.name || 'Student');

    if (approved) {
      ticket.status = 'Resolved';
      ticket.rating = Number(rating) || 5;
      ticket.ratingFeedback = feedback || 'Verified and approved by student.';
      ticket.updatedAt = timestamp;
      if (!ticket.resolutionProof) ticket.resolutionProof = {};
      ticket.resolutionProof.verifiedByStudent = true;
      ticket.resolutionProof.studentVerifiedAt = timestamp;

      if (ticket.timeline) {
        ticket.timeline.forEach(t => {
          t.completed = true;
          if (!t.timestamp) t.timestamp = new Date();
        });
      }

      ticket.auditLogs.unshift({
        id: uuidv4(),
        timestamp: now(),
        author: studentAuthor,
        role: 'Student',
        action: 'Student Verified & Approved Resolution',
        note: `Two-Way Verification Approved (${ticket.rating}/5 Stars). ${feedback}`
      });

      await ticket.save();
      return res.json({
        success: true,
        message: 'Resolution verified and closed by student!',
        data: ticket
      });
    } else {
      ticket.status = 'In Progress';
      ticket.isReopened = true;
      ticket.reopenReason = reason || 'Student disputed resolution proof; issue persists.';
      ticket.reopenedAt = new Date();
      ticket.updatedAt = timestamp;

      if (ticket.timeline) {
        const resStep = ticket.timeline.find(t => t.stepKey === 'resolved');
        if (resStep) resStep.completed = false;
      }

      ticket.auditLogs.unshift({
        id: uuidv4(),
        timestamp: now(),
        author: studentAuthor,
        role: 'Student',
        action: 'Student Disputed Resolution & Re-opened',
        note: `Disputed resolution proof: ${ticket.reopenReason}`
      });

      await ticket.save();
      return res.json({
        success: true,
        message: 'Resolution disputed. Ticket re-opened for HOD re-inspection.',
        data: ticket
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/:id/rating — Submit Rating & Feedback ────────────────
router.post('/:id/rating', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    ticket.rating = Number(rating) || 5;
    ticket.ratingFeedback = feedback || '';
    ticket.auditLogs.unshift({
      id: uuidv4(),
      timestamp: now(),
      author: ticket.isAnonymous ? 'Anonymous Student' : ticket.complainant?.name || 'Student',
      role: 'Student',
      action: 'Rating & Feedback Submitted',
      note: `Rated ${rating}/5 Stars. Feedback: ${feedback || 'None'}`
    });

    await ticket.save();
    res.json({ success: true, message: 'Rating saved successfully!', data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/:id/reopen — Reopen Resolved Complaint ───────────────
router.post('/:id/reopen', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ success: false, error: 'Reason for reopening is required' });

    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    ticket.status = 'In Progress';
    ticket.isReopened = true;
    ticket.reopenReason = reason;
    ticket.reopenedAt = new Date();

    // Reset resolved step in timeline
    if (ticket.timeline) {
      const resStep = ticket.timeline.find(t => t.stepKey === 'resolved');
      if (resStep) resStep.completed = false;
    }

    ticket.auditLogs.unshift({
      id: uuidv4(),
      timestamp: now(),
      author: ticket.isAnonymous ? 'Anonymous Student' : ticket.complainant?.name || 'Student',
      role: 'Student',
      action: 'Complaint Re-opened',
      note: `Re-opened by student. Reason: ${reason}`
    });

    await ticket.save();
    res.json({ success: true, message: 'Complaint re-opened for department re-inspection.', data: ticket });
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
    const remarks = responseRemarks || (normalizedStatus === 'rejected' ? 'Complaint rejected after official verification.' : `Status updated to ${status}.`);
    const nowObj = new Date();

    curTicket.status = status;
    curTicket.responseRemarks = remarks;
    curTicket.updatedAt = `${today()}, ${now()}`;
    curTicket.auditLogs.unshift({
      id: uuidv4(),
      timestamp: now(),
      author: updatedBy,
      role: role,
      action: `Status -> ${status}`,
      note: remarks
    });

    if (curTicket.timeline) {
      if (['investigating', 'under review', 'assigned'].includes(normalizedStatus)) {
        const step = curTicket.timeline.find(t => t.stepKey === 'assigned');
        if (step) { step.completed = true; step.timestamp = nowObj; step.note = remarks; }
      }
      if (['dispatched', 'in progress', 'pending student verification'].includes(normalizedStatus)) {
        const step = curTicket.timeline.find(t => t.stepKey === 'in_progress');
        if (step) { step.completed = true; step.timestamp = nowObj; step.note = remarks; }
      }
      if (normalizedStatus === 'pending student verification') {
        curTicket.resolutionProof = {
          remarks,
          proofUrl: '',
          resolvedByHOD: updatedBy,
          resolvedAt: `${today()}, ${now()}`,
          verifiedByStudent: false,
          studentVerifiedAt: ''
        };
      }
      if (normalizedStatus === 'resolved') {
        curTicket.timeline.forEach(t => { t.completed = true; if (!t.timestamp) t.timestamp = nowObj; });
      }
    }

    await curTicket.save();
    res.json({ success: true, message: `Status updated to ${status}`, data: curTicket });
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

    const nowObj = new Date();
    curTicket.assignedAgent = { name: agentName, role: agentRole || 'Staff Specialist', department: department || curTicket.department };
    curTicket.department = department || curTicket.department;
    curTicket.status = curTicket.status === 'Submitted' || curTicket.status === 'new' ? 'Assigned' : curTicket.status;
    curTicket.updatedAt = `${today()}, ${now()}`;

    if (curTicket.timeline) {
      const stepAssigned = curTicket.timeline.find(t => t.stepKey === 'assigned');
      if (stepAssigned) {
        stepAssigned.completed = true;
        stepAssigned.timestamp = nowObj;
        stepAssigned.note = `Assigned to ${agentName}`;
      }
    }

    await curTicket.save();
    res.json({ success: true, message: `Complaint assigned to ${agentName}`, data: curTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/tickets/:id/notes — Add Official Audit Note / Response Remarks ─
router.post('/:id/notes', async (req, res) => {
  try {
    const { note, author = 'Admin Officer', role = 'Admin' } = req.body;
    const curTicket = await Ticket.findOne({ id: req.params.id });
    if (!curTicket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    if (note) {
      curTicket.responseRemarks = note;
      curTicket.updatedAt = `${today()}, ${now()}`;
      if (!Array.isArray(curTicket.auditLogs)) curTicket.auditLogs = [];
      curTicket.auditLogs.unshift({
        id: uuidv4(),
        timestamp: now(),
        author,
        role,
        action: 'Admin Remarks Added',
        note
      });
      await curTicket.save();
    }
    res.json({ success: true, message: 'Remarks added successfully', data: curTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /api/tickets/:id/escalate — Escalate Ticket Priority ──────────────
router.patch('/:id/escalate', async (req, res) => {
  try {
    const curTicket = await Ticket.findOne({ id: req.params.id });
    if (!curTicket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    curTicket.priority = 'Urgent';
    curTicket.urgency = 'critical';
    curTicket.isEscalated = true;
    curTicket.escalationLevel = 'LEVEL_2_DEAN';
    curTicket.updatedAt = `${today()}, ${now()}`;
    await curTicket.save();
    res.json({ success: true, message: 'Ticket escalated to Urgent/Critical', data: curTicket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/tickets/:id — Delete Complaint & Unlink Attachments ────────
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ success: false, error: 'Complaint not found' });

    // Unlink physical attachment files from disk
    if (ticket.attachments && Array.isArray(ticket.attachments)) {
      ticket.attachments.forEach(att => {
        if (att.fileName) {
          const filePath = path.join(__dirname, '../uploads/attachments', att.fileName);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
          }
        }
      });
    }

    await Ticket.deleteOne({ _id: ticket._id });
    res.json({ success: true, message: `Complaint ${req.params.id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
