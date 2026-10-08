const Ticket = require('../models/Ticket');

/**
 * Evaluates all pending complaints against university SLA rules:
 * - LEVEL_0_STAFF: 0 to 3 days (Department Specialist / Technician)
 * - LEVEL_1_HOD: > 3 days pending (Escalated to Head of Department)
 * - LEVEL_2_DEAN: > 6 days pending (Escalated to Dean of Student Affairs / Directorate)
 */
async function runSLAEscalationCheck() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
  const sixDaysAgo = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000));

  let escalatedCount = 0;

  try {
    // 1. Level 0 -> Level 1 (HOD Escalation for tickets > 3 days old)
    const pendingForHOD = await Ticket.find({
      status: { $in: ['Submitted', 'Assigned', 'In Progress', 'new', 'investigating', 'dispatched'] },
      escalationLevel: 'LEVEL_0_STAFF',
      createdAt: { $lte: threeDaysAgo }
    });

    for (const ticket of pendingForHOD) {
      ticket.escalationLevel = 'LEVEL_1_HOD';
      ticket.isEscalated = true;
      ticket.escalatedAt = now;
      ticket.escalationReason = 'Automatic SLA Escalation: Grievance pending > 3 days. Escalated to Head of Department (HOD).';
      
      ticket.auditLogs.push({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now.toLocaleString('en-IN'),
        author: 'ResolveHub SLA Engine',
        role: 'System Worker',
        action: 'SLA_AUTO_ESCALATE_HOD',
        note: 'Escalated to HOD due to 3-day SLA threshold breach.'
      });

      await ticket.save();
      escalatedCount++;
    }

    // 2. Level 1 -> Level 2 (Dean Escalation for tickets > 6 days old)
    const pendingForDean = await Ticket.find({
      status: { $in: ['Submitted', 'Assigned', 'In Progress', 'new', 'investigating', 'dispatched'] },
      escalationLevel: 'LEVEL_1_HOD',
      createdAt: { $lte: sixDaysAgo }
    });

    for (const ticket of pendingForDean) {
      ticket.escalationLevel = 'LEVEL_2_DEAN';
      ticket.isEscalated = true;
      ticket.escalatedAt = now;
      ticket.escalationReason = 'Critical SLA Escalation: Grievance unresolved > 6 days. Escalated to Dean of Student Affairs.';
      
      ticket.auditLogs.push({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now.toLocaleString('en-IN'),
        author: 'ResolveHub SLA Engine',
        role: 'System Worker',
        action: 'SLA_AUTO_ESCALATE_DEAN',
        note: 'Escalated to Dean due to 6-day critical SLA threshold breach.'
      });

      await ticket.save();
      escalatedCount++;
    }

    return { success: true, escalatedCount };
  } catch (err) {
    console.error('⚠️ Error running SLA Escalation Service:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Starts automatic cron timer for SLA Escalation (runs every 2 hours)
 */
function startSLAWorkerInterval() {
  console.log('⏱️ SLA Escalation Worker initialized (Runs every 2 hours)...');
  // Initial check on boot
  runSLAEscalationCheck();
  // Interval check every 2 hours
  setInterval(runSLAEscalationCheck, 2 * 60 * 60 * 1000);
}

module.exports = {
  runSLAEscalationCheck,
  startSLAWorkerInterval
};
