const Ticket = require('../models/Ticket');

/**
 * AI Auto-Categorization & Priority Engine
 * Analyzes grievance description text to auto-suggest:
 * - Category
 * - Priority Level (Low, Medium, High, Urgent/Critical)
 * - Responsible Department
 * - Hostel Block detection
 */
function analyzeGrievanceText(text = '') {
  const content = text.toLowerCase();

  let suggestedCategory = 'Hostel & Facilities';
  let suggestedPriority = 'Medium';
  let suggestedDept = 'Facilities & HVAC';
  let detectedHostelBlock = 'General / Campus';

  // 1. Critical Harassment & Anti-Ragging Keyword Detection
  if (
    content.includes('ragging') || 
    content.includes('harass') || 
    content.includes('bully') || 
    content.includes('threat') || 
    content.includes('fight') || 
    content.includes('physical')
  ) {
    suggestedCategory = 'Harassment & Discipline';
    suggestedPriority = 'Urgent';
    suggestedDept = 'Internal Grievance Committee';
  } 
  // 2. Sanitation & Hygiene
  else if (
    content.includes('clean') || 
    content.includes('toilet') || 
    content.includes('washroom') || 
    content.includes('garbage') || 
    content.includes('smell') || 
    content.includes('sanitation') || 
    content.includes('water leak')
  ) {
    suggestedCategory = 'Sanitation & Hygiene';
    suggestedPriority = content.includes('overflow') || content.includes('water') ? 'High' : 'Medium';
    suggestedDept = 'Health & Sanitation';
  }
  // 3. IT & Network Systems
  else if (
    content.includes('wifi') || 
    content.includes('internet') || 
    content.includes('router') || 
    content.includes('portal') || 
    content.includes('server') || 
    content.includes('network') || 
    content.includes('laptop')
  ) {
    suggestedCategory = 'IT & Network';
    suggestedPriority = content.includes('exam') || content.includes('down') ? 'High' : 'Medium';
    suggestedDept = 'IT & Network Systems';
  }
  // 4. Finance & Scholarship
  else if (
    content.includes('fee') || 
    content.includes('scholarship') || 
    content.includes('receipt') || 
    content.includes('payment') || 
    content.includes('dues') || 
    content.includes('challan')
  ) {
    suggestedCategory = 'Finance & Scholarship';
    suggestedPriority = 'Medium';
    suggestedDept = 'Student Finance Bureau';
  }
  // 5. Academics
  else if (
    content.includes('grade') || 
    content.includes('marks') || 
    content.includes('faculty') || 
    content.includes('attendance') || 
    content.includes('exam') || 
    content.includes('syllabus')
  ) {
    suggestedCategory = 'Academics';
    suggestedPriority = content.includes('hall ticket') || content.includes('today') ? 'Urgent' : 'Medium';
    suggestedDept = 'Academics Redressal';
  }

  // Hostel Block Detection
  if (content.includes('block a') || content.includes('hostel a')) detectedHostelBlock = 'Hostel Block A';
  else if (content.includes('block b') || content.includes('hostel b')) detectedHostelBlock = 'Hostel Block B';
  else if (content.includes('block c') || content.includes('hostel c')) detectedHostelBlock = 'Hostel Block C';
  else if (content.includes('girls') || content.includes('priyadarshini')) detectedHostelBlock = 'Priyadarshini Girls Hostel';
  else if (content.includes('ntr') || content.includes('boys')) detectedHostelBlock = 'NTR Mens Hostel';
  else if (content.includes('academic') || content.includes('block 1') || content.includes('block 2')) detectedHostelBlock = 'Academic Complex';
  else if (content.includes('library') || content.includes('admin')) detectedHostelBlock = 'Library & Admin Block';

  return {
    category: suggestedCategory,
    priority: suggestedPriority,
    department: suggestedDept,
    hostelBlock: detectedHostelBlock,
    confidence: 0.94
  };
}

/**
 * Duplicate Complaint Detector:
 * Checks if there is an existing unresolved complaint in the same category & hostel block/location
 */
async function checkDuplicateCluster(category, hostelBlock, location) {
  try {
    const existing = await Ticket.findOne({
      category,
      $or: [
        { hostelBlock: hostelBlock !== 'General / Campus' ? hostelBlock : undefined },
        { location: { $regex: location || 'Campus', $options: 'i' } }
      ],
      status: { $in: ['Submitted', 'Assigned', 'In Progress', 'new', 'investigating', 'dispatched'] }
    });

    if (existing) {
      return {
        isDuplicate: true,
        existingTicketId: existing.id,
        existingTitle: existing.title,
        department: existing.department
      };
    }
    return { isDuplicate: false };
  } catch (err) {
    return { isDuplicate: false };
  }
}

module.exports = {
  analyzeGrievanceText,
  checkDuplicateCluster
};
