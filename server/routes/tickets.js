const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Ticket, uuidv4, logActivity } = require('../db');
const { uploadAttachments } = require('../middleware/uploadAttachment');
const { analyzeGrievanceText, checkDuplicateCluster } = require('../services/aiCategorizerService');

const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ── GET /api/tickets — Role-based Scoped Querying & Multi-Filtering ─────────────
router.get('/', async (req, res) => {
  try {
    const { role, department, regNo, category, status, priority, q } = req.query;
    let queryFilter = {};

    // 1. Role-based Scoping Guard
    if (role === 'dept_admin' && department) {
      // Support matching full name "Information Technology (IT)" or short name "Information Technology"
      const deptPattern = department.replace(/\s*\(.*?\)/, '').trim();
      queryFilter.department = { $regex: deptPattern, $options: 'i' };
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
      title,
      category,
      department: reqDept,
      urgency = 'medium',
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

    const regNoClean = (studentRegNo || '241FA07001').toUpperCase();
    const nameClean = studentName || `Student ${regNoClean}`;
    const emailClean = studentEmail || `${regNoClean.toLowerCase()}@campus.edu`;

    const aiInfo = analyzeGrievanceText(description);

    const deptMap = {
      'Transport': 'Information Technology (IT)',
      'Examinations': 'CSE (Computer Science & Engineering)',
      'Library': 'Information Technology (IT)',
      'Canteen & Food': 'Information Technology (IT)',
      'Security & Safety': 'EEE (Electrical & Electronics Engineering)',
      'Placements & Training': 'Information Technology (IT)',
      'Infrastructure & Maintenance': 'Mechanical Engineering',
      'Sports & Clubs': 'Mechanical Engineering',
      'Administration & Certificates': 'CS-BS (Computer Science & Business Systems)',
      'Health & Medical': 'BI & BT (Bio-Informatics & Bio-Technology)',
      'Faculty & Teaching': 'ECE (Electronics & Communication Engineering)',
      'Others': 'Information Technology (IT)'
    };

    const assignedDepartment = reqDept || deptMap[category] || aiInfo.department || 'Information Technology (IT)';
    const etaMap = { critical: 120, urgent: 120, high: 240, medium: 480, low: 960 };
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `RP-${randNum}`;
    const timestamp = `${today()}, ${now()}`;

    const titleExtract = title || (description.length > 55 ? description.substring(0, 52) + '...' : description);

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
      urgency: urgency.toLowerCase(),
      priority: urgency.toLowerCase() === 'critical' ? 'Urgent' : 'Medium',
      status: 'Submitted',
      slaStatus: urgency.toLowerCase() === 'critical' ? 'warning' : 'normal',
      isAnonymous: Boolean(isAnonymous),
      anonymousAlias: isAnonymous ? 'Anonymous Student (Shielded)' : undefined,
      locationId: locationId || null,
      zone: zone || 'Online / No location',
      hostelBlock: hostelBlock || aiInfo.hostelBlock,
      location: location || 'Main Campus',
      description,
      aiSuggestedCategory: aiInfo.category,
      aiSuggestedPriority: aiInfo.priority,
      aiSuggestedDept: aiInfo.department,
      complainant: {
        regNo: regNoClean,
        name: nameClean,
        email: emailClean,
        role: 'Student',
        department: studentDept || 'Engineering'
      },
      submittedBy: isAnonymous ? 'Confidential Anonymous Submission' : `Reg No: ${regNoClean} (${emailClean})`,
      assignedAgent: null,
      responseRemarks: '',
      eta: '3 Business Days (SLA Target)',
      etaMinutesLeft: etaMap[urgency.toLowerCase()] || 480,
      createdAt: timestamp,
      updatedAt: timestamp,
      attachments: processedAttachments,
      auditLogs: [{
        id: uuidv4(),
        timestamp: now(),
        author: isAnonymous ? 'Anonymous Student' : `Student ${regNoClean}`,
        role: 'Student',
        action: isAnonymous ? 'Anonymous Complaint Logged' : 'Complaint Logged',
        note: `Registered with ${urgency.toUpperCase()} priority. ${isAnonymous ? '[Identity Shielded for Welfare]' : ''}`
      }]
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
      if (['dispatched', 'in progress'].includes(normalizedStatus)) {
        const step = curTicket.timeline.find(t => t.stepKey === 'in_progress');
        if (step) { step.completed = true; step.timestamp = nowObj; step.note = remarks; }
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
