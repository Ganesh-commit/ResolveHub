const { Ticket, User, Staff, logActivity } = require('../db');
const { analyzeGrievanceText, checkDuplicateCluster } = require('./aiCategorizerService');

// ── Tool Definitions ────────────────────────────────────────────────────────
const STUDENT_TOOLS = [
  {
    name: 'get_my_complaints',
    description: 'Fetch all complaints submitted by the currently authenticated student.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter status: Submitted, Assigned, In Progress, Resolved, Rejected, or all' }
      }
    }
  },
  {
    name: 'get_complaint_status',
    description: 'Get real-time status, timeline stepper, SLA escalation level, and assigned team for a specific ticket ID.',
    parameters: {
      type: 'object',
      properties: {
        ticketId: { type: 'string', description: 'Complaint ID (e.g. #RH-1002 or RH-1002)' }
      },
      required: ['ticketId']
    }
  },
  {
    name: 'submit_complaint',
    description: 'Submit a new grievance ticket. Identity is securely bound to the authenticated student session.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short descriptive title of the grievance' },
        category: { type: 'string', description: 'Category (e.g., Hostel & Facilities, Academics, IT & Network, Transport, Finance, Canteen)' },
        department: { type: 'string', description: 'Responsible department' },
        location: { type: 'string', description: 'Specific location or Hostel block' },
        urgency: { type: 'string', enum: ['Low', 'Medium', 'High', 'Urgent'] },
        description: { type: 'string', description: 'Detailed grievance explanation' },
        isAnonymous: { type: 'boolean', description: 'Set true to shield identity from department staff' }
      },
      required: ['title', 'category', 'description']
    }
  }
];

const ADMIN_TOOLS = [
  {
    name: 'get_admin_analytics',
    description: 'Get natural language analytics, unresolved complaint metrics, SLA bottleneck departments, and category breakdowns.',
    parameters: {
      type: 'object',
      properties: {
        queryType: { type: 'string', enum: ['summary', 'unresolved', 'by_category', 'delayed'] }
      }
    }
  },
  {
    name: 'draft_admin_response',
    description: 'Draft a polite, professional resolution or update message for an admin to send to a student.',
    parameters: {
      type: 'object',
      properties: {
        ticketId: { type: 'string', description: 'Ticket ID' },
        actionTaken: { type: 'string', description: 'Key action taken or inspection result' },
        tone: { type: 'string', enum: ['formal', 'empathetic', 'action_oriented'] }
      },
      required: ['ticketId', 'actionTaken']
    }
  }
];

// ── Tool Executor ───────────────────────────────────────────────────────────
async function executeTool(toolName, args = {}, sessionUser = null) {
  if (!sessionUser) {
    return { success: false, error: 'Authentication required. Please log in to perform this action.' };
  }

  try {
    switch (toolName) {
      case 'get_my_complaints': {
        const studentRegNo = sessionUser.regNo || sessionUser.username;
        if (!studentRegNo) {
          return { success: false, error: 'Student registration number not found in active session.' };
        }

        const queryFilter = {
          $or: [
            { 'complainant.regNo': { $regex: studentRegNo, $options: 'i' } },
            { submittedBy: { $regex: studentRegNo, $options: 'i' } }
          ]
        };

        if (args.status && args.status.toLowerCase() !== 'all') {
          queryFilter.status = { $regex: `^${args.status}$`, $options: 'i' };
        }

        const tickets = await Ticket.find(queryFilter).sort({ createdAt: -1 }).lean();

        const formattedTickets = tickets.map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          department: t.department,
          location: t.location || 'Campus',
          urgency: t.urgency || t.priority || 'Medium',
          status: t.status,
          createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : 'Recent',
          assignedTo: t.assignedTo || 'Department Desk',
          responseRemarks: t.responseRemarks || 'Pending review'
        }));

        return {
          success: true,
          count: formattedTickets.length,
          studentRegNo: sessionUser.regNo,
          complaints: formattedTickets
        };
      }

      case 'get_complaint_status': {
        if (!args.ticketId) {
          return { success: false, error: 'Ticket ID is required.' };
        }

        const cleanId = args.ticketId.trim().replace(/^#/, '');
        const ticket = await Ticket.findOne({
          $or: [
            { id: cleanId },
            { id: `#${cleanId}` },
            { id: args.ticketId.trim() }
          ]
        }).lean();

        if (!ticket) {
          return { success: false, error: `No complaint found with ID "${args.ticketId}". Please check the ticket number.` };
        }

        // Ownership & Anonymous check
        if (sessionUser.role === 'student' && sessionUser.regNo) {
          const isOwner = ticket.complainant?.regNo?.toUpperCase() === sessionUser.regNo.toUpperCase() ||
                          ticket.submittedBy?.toUpperCase().includes(sessionUser.regNo.toUpperCase());
          if (!isOwner) {
            return { success: false, error: 'Access denied: You can only view status for your own submitted complaints.' };
          }
        }

        // Calculate SLA status
        const createdDate = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
        const daysElapsed = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
        let slaStatus = 'Normal (Within 3-Day SLA)';
        let escalationLevel = 'Department Desk';

        if (ticket.status !== 'Resolved' && ticket.status !== 'Rejected') {
          if (daysElapsed >= 6) {
            slaStatus = '🔴 Overdue (SLA Breached - 6+ Days)';
            escalationLevel = 'Dean / University Director';
          } else if (daysElapsed >= 3) {
            slaStatus = '⚠️ Escalated (3+ Days Unresolved)';
            escalationLevel = 'Head of Department (HOD)';
          }
        }

        // Anonymous identity shield if staff is looking
        const isAnonymous = ticket.isAnonymous;
        const complainantInfo = (sessionUser.role !== 'student' && isAnonymous)
          ? { name: 'Anonymous Student (Identity Shielded)', regNo: 'MASKED-XXXX' }
          : ticket.complainant;

        return {
          success: true,
          ticket: {
            id: ticket.id,
            title: ticket.title,
            category: ticket.category,
            department: ticket.department,
            location: ticket.location || 'Campus',
            urgency: ticket.urgency || ticket.priority || 'Medium',
            status: ticket.status,
            isAnonymous: ticket.isAnonymous,
            complainant: complainantInfo,
            assignedTo: ticket.assignedTo || 'Department Specialist',
            slaStatus,
            daysElapsed,
            escalationLevel,
            responseRemarks: ticket.responseRemarks || 'Inspection in progress.',
            timeline: ticket.timeline || [
              { status: 'Submitted', timestamp: 'Initial submission', note: 'Grievance received' }
            ]
          }
        };
      }

      case 'submit_complaint': {
        // Verification: enforce authenticated student identity
        if (sessionUser.role !== 'student' && !sessionUser.regNo) {
          return { success: false, error: 'Only logged-in students can submit complaint tickets.' };
        }

        const studentName = sessionUser.name || 'Student';
        const studentRegNo = sessionUser.regNo || 'UNKNOWN';
        const studentEmail = sessionUser.email || `${studentRegNo.toLowerCase()}@vignan.ac.in`;

        // Check potential duplicates
        const dupCheck = await checkDuplicateCluster(args.category, args.location, args.location);

        const newIdNum = Math.floor(1000 + Math.random() * 9000);
        const ticketId = `#RH-${newIdNum}`;
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        const createdTicket = await Ticket.create({
          id: ticketId,
          title: args.title,
          category: args.category,
          department: args.department || 'General Administration',
          location: args.location || 'Campus',
          urgency: args.urgency || 'Medium',
          priority: args.urgency || 'Medium',
          description: args.description,
          isAnonymous: !!args.isAnonymous,
          status: 'Submitted',
          submittedBy: args.isAnonymous ? 'Confidential Anonymous Student' : studentName,
          complainant: {
            name: args.isAnonymous ? 'Anonymous Student (Identity Shielded)' : studentName,
            regNo: args.isAnonymous ? 'MASKED-XXXX' : studentRegNo,
            email: args.isAnonymous ? 'confidential@campus.edu' : studentEmail,
            role: 'Student'
          },
          timeline: [
            {
              status: 'Submitted',
              timestamp: `${todayStr}, ${nowStr}`,
              note: `Grievance submitted via ResolveHub Assistant ${args.isAnonymous ? '(Anonymous Shielded)' : ''}`
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await logActivity(
          args.isAnonymous ? 'Anonymous Student' : studentName,
          'Student',
          'AI Ticket Creation',
          `Created grievance ${ticketId} in ${args.category}`
        );

        return {
          success: true,
          message: 'Complaint submitted successfully!',
          ticketId: createdTicket.id,
          title: createdTicket.title,
          category: createdTicket.category,
          department: createdTicket.department,
          status: createdTicket.status,
          slaTimeframe: args.urgency === 'Urgent' ? '24 Hours' : '3 Business Days',
          duplicateWarning: dupCheck.isDuplicate ? {
            existingTicketId: dupCheck.existingTicketId,
            existingTitle: dupCheck.existingTitle,
            note: 'A similar open complaint exists in this category/location.'
          } : null
        };
      }

      case 'get_admin_analytics': {
        if (sessionUser.role !== 'super_admin' && sessionUser.role !== 'dept_admin') {
          return { success: false, error: 'Unauthorized: Admin access required for analytics tools.' };
        }

        const deptFilter = sessionUser.role === 'dept_admin' && sessionUser.department ? { department: sessionUser.department } : {};
        const tickets = await Ticket.find(deptFilter).lean();

        const total = tickets.length;
        const pending = tickets.filter(t => t.status === 'Submitted' || t.status === 'new').length;
        const inProgress = tickets.filter(t => t.status === 'Assigned' || t.status === 'In Progress' || t.status === 'investigating').length;
        const resolved = tickets.filter(t => t.status === 'Resolved').length;
        const rejected = tickets.filter(t => t.status === 'Rejected').length;

        // Overdue tickets calculation
        const now = new Date();
        const delayedTickets = tickets.filter(t => {
          if (t.status === 'Resolved' || t.status === 'Rejected') return false;
          const created = t.createdAt ? new Date(t.createdAt) : now;
          const diffDays = (now - created) / (1000 * 60 * 60 * 24);
          return diffDays >= 3;
        });

        // Category breakdown
        const categoryMap = {};
        tickets.forEach(t => {
          const cat = t.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        return {
          success: true,
          adminRole: sessionUser.role,
          departmentScope: sessionUser.department || 'All Departments',
          metrics: {
            totalComplaints: total,
            pendingCount: pending,
            inProgressCount: inProgress,
            resolvedCount: resolved,
            rejectedCount: rejected,
            slaBreachedCount: delayedTickets.length,
            categoryBreakdown: categoryMap
          },
          delayedTickets: delayedTickets.slice(0, 5).map(dt => ({
            id: dt.id,
            title: dt.title,
            category: dt.category,
            department: dt.department,
            daysOpen: Math.floor((now - new Date(dt.createdAt || now)) / (1000 * 60 * 60 * 24))
          }))
        };
      }

      case 'draft_admin_response': {
        if (sessionUser.role !== 'super_admin' && sessionUser.role !== 'dept_admin') {
          return { success: false, error: 'Unauthorized: Admin access required.' };
        }

        const { ticketId, actionTaken, tone = 'formal' } = args;

        let greeting = 'Dear Student,';
        let closing = 'Best regards,\nResolveHub Grievance Redressal Team\nVignan University';

        if (tone === 'empathetic') {
          greeting = 'Dear Student, thank you for bringing this issue to our attention. We understand the inconvenience this caused.';
          closing = 'Sincerely,\nDepartment Administration & Student Welfare Cell';
        } else if (tone === 'action_oriented') {
          greeting = 'Grievance Resolution Update:';
          closing = 'Regards,\nFacilities Maintenance & Operations Desk';
        }

        const draftText = `${greeting}\n\nRegarding ticket ${ticketId}: ${actionTaken}\n\nOur maintenance team has verified this action. If you experience any further difficulty, you can reply or re-open this ticket from your dashboard.\n\n${closing}`;

        return {
          success: true,
          ticketId,
          tone,
          draftedResponse: draftText
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    console.error(`Error executing AI tool ${toolName}:`, err);
    return { success: false, error: err.message || 'Error executing AI tool request.' };
  }
}

module.exports = {
  STUDENT_TOOLS,
  ADMIN_TOOLS,
  executeTool
};
