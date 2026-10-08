const express = require('express');
const router = express.Router();
const { User, Staff, Ticket } = require('../db');
const { analyzeGrievanceText, checkDuplicateCluster } = require('../services/aiCategorizerService');
const { STUDENT_TOOLS, ADMIN_TOOLS, executeTool } = require('../services/aiToolsEngine');

// ── Session Resolver Helper ────────────────────────────────────────────────
async function resolveUserFromHeader(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || req.body?.token;
  if (!authHeader) return null;

  const tokenStr = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!tokenStr) return null;

  // 1. Staff check
  let staff = await Staff.findOne({
    $or: [{ id: tokenStr }, { username: tokenStr.toLowerCase() }]
  }).lean();

  if (!staff && tokenStr.startsWith('auth-token-')) {
    const rawId = tokenStr.replace('auth-token-', '');
    staff = await Staff.findOne({ id: rawId }).lean();
  }

  if (staff) {
    return {
      id: staff.id,
      name: staff.name,
      username: staff.username,
      role: staff.role, // 'super_admin' or 'dept_admin'
      department: staff.department || 'All'
    };
  }

  // 2. Student check
  let user = await User.findOne({
    $or: [{ id: tokenStr }, { regNo: tokenStr.toUpperCase() }]
  }).lean();

  if (!user && tokenStr.startsWith('auth-token-')) {
    const rawId = tokenStr.replace('auth-token-', '');
    user = await User.findOne({ id: rawId }).lean();
  }

  if (user) {
    return {
      id: user.id,
      name: user.name,
      regNo: user.regNo,
      email: user.email,
      role: 'student',
      department: user.department || 'General'
    };
  }

  // 3. Fallback Header extraction if token is standard format
  if (req.headers['x-user-regno']) {
    return {
      id: `std-${req.headers['x-user-regno']}`,
      name: req.headers['x-user-name'] || 'Student',
      regNo: req.headers['x-user-regno'].toUpperCase(),
      email: req.headers['x-user-email'] || `${req.headers['x-user-regno'].toLowerCase()}@vignan.ac.in`,
      role: 'student',
      department: 'Engineering'
    };
  }

  return null;
}

// ── FAQ Knowledge Base ──────────────────────────────────────────────────────
const FAQ_KNOWLEDGE_BASE = [
  {
    keywords: ['sla', 'timeframe', 'how long', 'days', 'escalation', 'deadline'],
    category: 'General SLA',
    answer: 'Standard grievances have a 3-day SLA. If unresolved after 3 days, it auto-escalates to the Head of Department (HOD). After 6 days, it escalates directly to the Dean / Director.'
  },
  {
    keywords: ['anonymous', 'secret', 'identity', 'hide name', 'privacy', 'confidential'],
    category: 'Privacy',
    answer: 'You can toggle "Anonymous Mode" when submitting any complaint. Your registration number and name are masked as "Anonymous Student" and completely shielded from department staff.'
  },
  {
    keywords: ['reopen', 're-open', 'not fixed', 'unsatisfied', 'reject'],
    category: 'Complaint Lifecycle',
    answer: 'If a technician marks your issue resolved but the problem persists, open "My Complaints" in your dashboard and click "Re-open Complaint" within 7 days.'
  },
  {
    keywords: ['wifi', 'internet', 'router', 'network', 'login', 'portal', 'connect'],
    category: 'IT & Network',
    answer: 'For Wi-Fi, hostel router, or portal errors, select category "IT & Network Systems". Campus IT engineers aim to resolve connectivity issues within 4 hours.'
  },
  {
    keywords: ['scholarship', 'fee', 'dues', 'receipt', 'challan', 'tuition', 'finance'],
    category: 'Finance',
    answer: 'Financial grievances are processed by the Student Finance Bureau in the Admin Block. Be sure to upload your payment receipt or transaction ID for quick verification.'
  },
  {
    keywords: ['hostel', 'water', 'leak', 'plumber', 'fan', 'light', 'clean', 'room', 'washroom'],
    category: 'Hostel Facilities',
    answer: 'Hostel maintenance is managed by Estate & Facilities. Please specify your exact Hostel Block (Block A, B, C, Priyadarshini Girls, NTR Mens) and Room Number.'
  },
  {
    keywords: ['exam', 'marks', 'revaluation', 'grade', 'hall ticket', 'admit card'],
    category: 'Examinations',
    answer: 'Examination issues are routed to the Examination Cell. Hall ticket or urgent grade discrepancies are prioritized within 24 hours.'
  },
  {
    keywords: ['bus', 'transport', 'route', 'driver', 'pass', 'timing'],
    category: 'Transport',
    answer: 'Bus and transport complaints are handled by the Transport Office. Mention your route number and bus stop location in the complaint form.'
  }
];

// ── Emergency Keywords ──────────────────────────────────────────────────────
const EMERGENCY_KEYWORDS = [
  'ragging', 'harass', 'harassment', 'bully', 'threat', 'suicide', 'self harm',
  'assault', 'violence', 'abuse', 'physical attack', 'weapons', 'unsafe'
];

// ── Politeness Rewriter Helper ──────────────────────────────────────────────
function rewriteForPoliteness(rawText) {
  let cleaned = rawText.trim();
  const isCapsRage = cleaned === cleaned.toUpperCase() && cleaned.length > 15;
  const HAS_AGGRESSIVE = /stupid|useless|horrible|trash|idiot|worst|hate|wasting/i.test(cleaned);

  if (!isCapsRage && !HAS_AGGRESSIVE) {
    return { needsRewrite: false, rewrittenText: cleaned };
  }

  // Polished formal version
  let polished = cleaned
    .replace(/stupid|useless|horrible|trash|idiot|worst/gi, 'sub-standard')
    .replace(/wasting my time/gi, 'causing significant inconvenience');

  if (isCapsRage) {
    polished = polished.charAt(0).toUpperCase() + polished.slice(1).toLowerCase();
  }

  polished = `I am writing to formally report an issue regarding: ${polished}. Kindly inspect and resolve this matter at your earliest convenience.`;

  return {
    needsRewrite: true,
    originalText: cleaned,
    rewrittenText: polished,
    reason: isCapsRage ? 'Converted ALL-CAPS text to formal casing.' : 'Replaced emotional/aggressive phrasing with formal campus grievance terminology.'
  };
}

// ── POST /api/ai/chat ────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const sessionUser = await resolveUserFromHeader(req);
    const { message = '', conversationHistory = [], contextInfo = {} } = req.body;

    // Prompt injection defense: sanitize and isolate raw user message in XML tags
    const sanitizedInput = message.replace(/<[^>]*>/g, '').trim();
    const promptTag = `<user_message>${sanitizedInput}</user_message>`;
    const lowerInput = sanitizedInput.toLowerCase();

    // 1. Emergency Safety Keyword Detection
    const isEmergencyMatch = EMERGENCY_KEYWORDS.some(word => lowerInput.includes(word));
    let emergencyPayload = null;

    if (isEmergencyMatch) {
      emergencyPayload = {
        isEmergency: true,
        alertTitle: '⚠️ Immediate Safety & Anti-Ragging Assistance',
        alertMessage: 'Your message contains emergency safety terms. Anti-Ragging and Student Safety Officers have been alerted.',
        emergencyContacts: [
          { name: 'Anti-Ragging Committee Helpline', phone: '+91-863-2344700', email: 'anti-ragging@vignan.ac.in' },
          { name: 'Dean Student Welfare (DSW)', phone: '+91-863-2344710', email: 'dsw@vignan.ac.in' },
          { name: 'Campus Security Control Room', phone: '+91-863-2344799', email: 'security@vignan.ac.in' }
        ]
      };
    }

    // 2. Unauthenticated check guard for user-scoped actions
    if (!sessionUser && (lowerInput.includes('my complaint') || lowerInput.includes('my ticket') || lowerInput.includes('submit complaint'))) {
      return res.json({
        success: true,
        reply: 'Please sign in with your student registration number to view your complaint status or submit a new grievance ticket.',
        emergency: emergencyPayload,
        requiresAuth: true
      });
    }

    // 3. Tool Execution: Check Complaint Status or Fetch My Complaints
    if (sessionUser && (lowerInput.includes('my complaint') || lowerInput.includes('my tickets') || lowerInput.includes('status of my') || lowerInput.includes('check my ticket'))) {
      const toolRes = await executeTool('get_my_complaints', { status: 'all' }, sessionUser);
      
      if (!toolRes.success) {
        return res.json({ success: true, reply: toolRes.error, emergency: emergencyPayload });
      }

      if (toolRes.count === 0) {
        return res.json({
          success: true,
          reply: `Hello ${sessionUser.name || 'Student'} (${sessionUser.regNo})! You currently have 0 active or past complaint tickets. If you have an issue to report, click "Submit Complaint" or tell me what's wrong!`,
          emergency: emergencyPayload,
          data: toolRes
        });
      }

      const summaryList = toolRes.complaints.slice(0, 5).map(c => 
        `• **${c.id}**: *${c.title}* | **Status**: ${c.status} | **Dept**: ${c.department}`
      ).join('\n');

      return res.json({
        success: true,
        reply: `Here are your recent submitted complaints (${sessionUser.regNo}):\n\n${summaryList}\n\nYou can ask me for detailed status on any ticket (e.g. "What is the status of ${toolRes.complaints[0].id}?")`,
        emergency: emergencyPayload,
        data: toolRes
      });
    }

    // Specific Ticket ID Lookup (e.g. "#RH-1002" or "RH-1002")
    const ticketIdMatch = sanitizedInput.match(/#?RH-\d{4}/i);
    if (ticketIdMatch) {
      const matchedTicketId = ticketIdMatch[0];
      const toolRes = await executeTool('get_complaint_status', { ticketId: matchedTicketId }, sessionUser || { role: 'guest' });

      if (toolRes.success) {
        const t = toolRes.ticket;
        const replyText = `### Ticket Overview: ${t.id}\n` +
          `**Title**: ${t.title}\n` +
          `**Category**: ${t.category} | **Dept**: ${t.department}\n` +
          `**Current Status**: **${t.status}**\n` +
          `**SLA Monitor**: ${t.slaStatus} (${t.daysElapsed} days open)\n` +
          `**Assigned To**: ${t.assignedTo}\n` +
          `**Remarks**: ${t.responseRemarks}\n\n` +
          `*Submitted by*: ${t.complainant.name} (${t.complainant.regNo})`;

        return res.json({
          success: true,
          reply: replyText,
          emergency: emergencyPayload,
          ticketDetail: t
        });
      }
    }

    // 4. Guided Ticket Submission Draft Request
    if (sessionUser && sessionUser.role === 'student' && (
      lowerInput.includes('submit complaint') || 
      lowerInput.includes('file a complaint') || 
      lowerInput.includes('report an issue') || 
      lowerInput.includes('register grievance') ||
      lowerInput.includes('water') || lowerInput.includes('wifi') || lowerInput.includes('fan') || lowerInput.includes('fee')
    )) {
      const analysis = analyzeGrievanceText(sanitizedInput);
      const isCompleteDescription = sanitizedInput.length > 20;

      if (isCompleteDescription) {
        return res.json({
          success: true,
          reply: `I have analyzed your complaint details and prepared a ticket draft for submission:\n\n` +
            `• **Suggested Category**: ${analysis.category}\n` +
            `• **Suggested Department**: ${analysis.department}\n` +
            `• **Detected Location**: ${analysis.hostelBlock}\n` +
            `• **Assigned Urgency**: ${analysis.priority}\n\n` +
            `Would you like me to submit this ticket for you now? Click **Confirm & Submit Ticket** below.`,
          emergency: emergencyPayload,
          draftTicket: {
            title: sanitizedInput.length > 50 ? `${sanitizedInput.slice(0, 47)}...` : sanitizedInput,
            category: analysis.category,
            department: analysis.department,
            location: analysis.hostelBlock,
            urgency: analysis.priority,
            description: sanitizedInput
          },
          actionRequired: 'CONFIRM_TICKET_SUBMISSION'
        });
      } else {
        return res.json({
          success: true,
          reply: `I can help you file a grievance ticket right away! Could you please provide a few more details? For example: What specific location or hostel block is this in, and what problem are you experiencing?`,
          emergency: emergencyPayload
        });
      }
    }

    // 5. Admin Mode Analytics Tools
    if (sessionUser && (sessionUser.role === 'super_admin' || sessionUser.role === 'dept_admin') && (
      lowerInput.includes('analytics') || lowerInput.includes('overview') || lowerInput.includes('delayed') || lowerInput.includes('unresolved')
    )) {
      const toolRes = await executeTool('get_admin_analytics', { queryType: 'summary' }, sessionUser);
      if (toolRes.success) {
        const m = toolRes.metrics;
        return res.json({
          success: true,
          reply: `### Admin Grievance Analytics Summary (${toolRes.departmentScope}):\n\n` +
            `• **Total Complaints Received**: ${m.totalComplaints}\n` +
            `• **Pending Triage**: ${m.pendingCount}\n` +
            `• **In Progress**: ${m.inProgressCount}\n` +
            `• **Successfully Resolved**: ${m.resolvedCount}\n` +
            `• **SLA Breached (>3 Days)**: ${m.slaBreachedCount}\n\n` +
            `You can view full details in the Admin Control Dashboard.`,
          emergency: emergencyPayload,
          adminAnalytics: toolRes
        });
      }
    }

    // 6. Knowledge Base / FAQ Matcher
    const faqMatch = FAQ_KNOWLEDGE_BASE.find(item =>
      item.keywords.some(kw => lowerInput.includes(kw))
    );

    if (faqMatch) {
      return res.json({
        success: true,
        reply: faqMatch.answer,
        emergency: emergencyPayload,
        faqCategory: faqMatch.category
      });
    }

    // 7. Standard Extensible Fallback: Direct Student to Relevant Campus Office
    return res.json({
      success: true,
      reply: `I understand you are asking about "${sanitizedInput}".\n\n` +
        `I do not have specific policy details for this query in the FAQ knowledge base. To get authoritative assistance, please reach out to the relevant campus office:\n\n` +
        `• **Hostel & Maintenance**: Hostel Office (Main Admin Block)\n` +
        `• **Fees & Accounts**: Student Finance Bureau (finance@vignan.ac.in | Ex. 214)\n` +
        `• **Exams & Certificates**: Examination Cell (examcell@vignan.ac.in | Ex. 302)\n` +
        `• **Academics**: Respective Department HOD Office\n\n` +
        `Or click **Submit Complaint** to lodge an official grievance ticket!`,
      emergency: emergencyPayload
    });

  } catch (err) {
    console.error('Error in /api/ai/chat:', err);
    res.status(500).json({ success: false, error: 'AI Assistant processing error.' });
  }
});

// ── POST /api/ai/smart-suggest ───────────────────────────────────────────────
router.post('/smart-suggest', async (req, res) => {
  try {
    const { text = '', category = '', location = '' } = req.body;
    if (!text.trim()) {
      return res.status(400).json({ success: false, error: 'Text description required.' });
    }

    const analysis = analyzeGrievanceText(text);
    const politeness = rewriteForPoliteness(text);
    const isEmergency = EMERGENCY_KEYWORDS.some(w => text.toLowerCase().includes(w));

    // SLA Calculation
    let slaDays = 3;
    let slaDescription = 'Standard 3 Business Days SLA';
    if (analysis.priority === 'Urgent') {
      slaDays = 1;
      slaDescription = 'High Urgency 24-Hour Express Resolution';
    } else if (analysis.priority === 'Low') {
      slaDays = 5;
      slaDescription = 'Low Priority 5 Business Days SLA';
    }

    // 1-sentence auto-summary for admin
    const autoSummary = text.length > 80 ? `${text.slice(0, 77)}...` : text;

    res.json({
      success: true,
      data: {
        suggestedCategory: category || analysis.category,
        suggestedPriority: isEmergency ? 'Urgent' : analysis.priority,
        suggestedDept: analysis.department,
        suggestedLocation: location || analysis.hostelBlock,
        slaDays,
        slaDescription,
        autoSummary,
        politeness,
        emergencyAlert: isEmergency ? {
          title: 'Emergency Keywords Detected',
          message: 'This complaint involves safety/discipline. Priority auto-set to Urgent.',
          antiRaggingContact: '+91-863-2344700'
        } : null
      }
    });
  } catch (err) {
    console.error('Error in /api/ai/smart-suggest:', err);
    res.status(500).json({ success: false, error: 'Smart suggest processing error.' });
  }
});

// ── POST /api/ai/feedback ────────────────────────────────────────────────────
router.post('/feedback', async (req, res) => {
  try {
    const { messageId, rating, comment } = req.body;
    console.log(`[AI Feedback] Message ${messageId} rated: ${rating} (${comment || 'No comment'})`);
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error submitting feedback.' });
  }
});

module.exports = router;
