/**
 * SuperAdmin Smart Triage & Department HOD Auto-Routing Engine
 * Automatically analyzes incoming student grievances and routes them to:
 * 1. The specific Department HOD (CSE, IT, AI&ML, Cyber Security, ECE, Robotics, BI&BT, Food Tech, Textile, CSBS, CSDS, Management BBA/MBA/MCA, or Estate & Hostel Warden)
 * 2. Or retains them under SuperAdmin Executive Desk if cross-departmental, critical safety, or beyond HOD scope.
 */

const UNIVERSITY_DEPARTMENTS = [
  'CSE (Computer Science & Engineering)',
  'Information Technology (IT)',
  'AI & ML (Artificial Intelligence & Machine Learning)',
  'Cyber Security',
  'ECE (Electronics & Communication Engineering)',
  'BI & BT (Bio-Informatics & Bio-Technology)',
  'Robotics',
  'Food Technology',
  'Textile Industry',
  'CS-BS (Computer Science & Business Systems)',
  'CS-DS (Computer Science & Data Science)',
  'BBA (Bachelor of Business Administration)',
  'MBA (Master of Business Administration)',
  'MCA (Master of Computer Applications)',
  'Management (BBA / MBA / MCA)',
  'Estate & Hostel Management'
];

const HOD_DIRECTORY = {
  CSE: {
    id: 'hod-cse-01',
    username: 'cse_hod_admin',
    passwordPlain: 'VignanCSE@2026',
    name: 'Dr. K. Venkata Rao (CSE HOD)',
    roleTitle: 'CSE HOD Admin',
    department: 'CSE (Computer Science & Engineering)',
    departmentAliases: ['CSE', 'CSE (Computer Science & Engineering)', 'Computer Science & Engineering'],
    email: 'hod.cse@vignan.ac.in',
    phone: '+91 98481 10001'
  },
  IT: {
    id: 'hod-it-01',
    username: 'it_network_admin',
    passwordPlain: 'VignanIT@2026',
    name: 'Dr. N. Srinivasu (IT & Network HOD)',
    roleTitle: 'IT & Network HOD',
    department: 'Information Technology (IT)',
    departmentAliases: ['IT', 'Information Technology (IT)', 'Information Technology', 'IT & Network Systems'],
    email: 'hod.it@vignan.ac.in',
    phone: '+91 98481 10002'
  },
  AIML: {
    id: 'hod-aiml-01',
    username: 'aiml_hod_admin',
    passwordPlain: 'VignanAIML@2026',
    name: 'Dr. S. Padmavathi (AI & ML HOD)',
    roleTitle: 'AI & ML HOD',
    department: 'AI & ML (Artificial Intelligence & Machine Learning)',
    departmentAliases: ['AI&ML', 'AI & ML', 'AI & ML (Artificial Intelligence & Machine Learning)'],
    email: 'hod.aiml@vignan.ac.in',
    phone: '+91 98481 10003'
  },
  CYBER: {
    id: 'hod-cyber-01',
    username: 'cyber_hod_admin',
    passwordPlain: 'VignanCyber@2026',
    name: 'Dr. R. Pradeep Kumar (Cyber Security HOD)',
    roleTitle: 'Cyber Security HOD',
    department: 'Cyber Security',
    departmentAliases: ['Cyber Security', 'CSE - Cyber Security', 'CyberSecurity'],
    email: 'hod.cyber@vignan.ac.in',
    phone: '+91 98481 10004'
  },
  ECE: {
    id: 'hod-ece-01',
    username: 'ece_hod_admin',
    passwordPlain: 'VignanECE@2026',
    name: 'Dr. M. Sarada Devi (ECE HOD)',
    roleTitle: 'ECE HOD Admin',
    department: 'ECE (Electronics & Communication Engineering)',
    departmentAliases: ['ECE', 'ECE (Electronics & Communication Engineering)', 'Electronics & Communication Engineering'],
    email: 'hod.ece@vignan.ac.in',
    phone: '+91 98481 10005'
  },
  ROBOTICS: {
    id: 'hod-robotics-01',
    username: 'robotics_hod_admin',
    passwordPlain: 'VignanRobotics@2026',
    name: 'Dr. P. Karthikeya (Robotics HOD)',
    roleTitle: 'Robotics HOD',
    department: 'Robotics',
    departmentAliases: ['Robotics', 'Robotics & Automation'],
    email: 'hod.robotics@vignan.ac.in',
    phone: '+91 98481 10006'
  },
  MGMT: {
    id: 'hod-mgmt-01',
    username: 'mgmt_hod_admin',
    passwordPlain: 'VignanMgmt@2026',
    name: 'Dr. V. Rajeshwari (Management BBA/MBA/MCA HOD)',
    roleTitle: 'Management (BBA/MBA/MCA) HOD',
    department: 'Management (BBA / MBA / MCA)',
    departmentAliases: [
      'Management (BBA / MBA / MCA)',
      'BBA',
      'MBA',
      'MCA',
      'BBA (Bachelor of Business Administration)',
      'MBA (Master of Business Administration)',
      'MCA (Master of Computer Applications)'
    ],
    email: 'hod.mgmt@vignan.ac.in',
    phone: '+91 98481 10007'
  },
  ESTATE: {
    id: 'hod-estate-01',
    username: 'estate_warden_admin',
    passwordPlain: 'VignanEstate@2026',
    name: 'Col. B. Suryanarayana (Estate & Chief Hostel Warden)',
    roleTitle: 'Estate & Hostel Warden',
    department: 'Estate & Hostel Management',
    departmentAliases: [
      'Estate & Hostel Management',
      'Facilities & HVAC',
      'Health & Sanitation',
      'Hostel & Facilities',
      'Mechanical Engineering',
      'EEE (Electrical & Electronics Engineering)'
    ],
    email: 'warden.estate@vignan.ac.in',
    phone: '+91 98481 10008'
  },
  BIBT: {
    id: 'hod-bibt-01',
    username: 'bibt_hod_admin',
    passwordPlain: 'VignanBIBT@2026',
    name: 'Dr. A. Hymavathi (BI & BT HOD)',
    roleTitle: 'BI & BT HOD',
    department: 'BI & BT (Bio-Informatics & Bio-Technology)',
    departmentAliases: ['BI&BT', 'BI & BT', 'BI & BT (Bio-Informatics & Bio-Technology)'],
    email: 'hod.bibt@vignan.ac.in',
    phone: '+91 98481 10009'
  },
  FOOD: {
    id: 'hod-food-01',
    username: 'foodtech_hod_admin',
    passwordPlain: 'VignanFood@2026',
    name: 'Dr. G. Subba Rao (Food Technology HOD)',
    roleTitle: 'Food Technology HOD',
    department: 'Food Technology',
    departmentAliases: ['Food Technology', 'Food Tech'],
    email: 'hod.foodtech@vignan.ac.in',
    phone: '+91 98481 10010'
  },
  TEXTILE: {
    id: 'hod-textile-01',
    username: 'textile_hod_admin',
    passwordPlain: 'VignanTextile@2026',
    name: 'Dr. T. Ramesh Babu (Textile Industry HOD)',
    roleTitle: 'Textile Industry HOD',
    department: 'Textile Industry',
    departmentAliases: ['Textile Industry', 'Textile Technology'],
    email: 'hod.textile@vignan.ac.in',
    phone: '+91 98481 10011'
  },
  CSBS: {
    id: 'hod-csbs-01',
    username: 'csbs_hod_admin',
    passwordPlain: 'VignanCSBS@2026',
    name: 'Dr. L. Jagannadham (CSBS HOD)',
    roleTitle: 'CSBS HOD',
    department: 'CS-BS (Computer Science & Business Systems)',
    departmentAliases: ['CSBS', 'CS-BS', 'CS-BS (Computer Science & Business Systems)'],
    email: 'hod.csbs@vignan.ac.in',
    phone: '+91 98481 10012'
  },
  CSDS: {
    id: 'hod-csds-01',
    username: 'csds_hod_admin',
    passwordPlain: 'VignanCSDS@2026',
    name: 'Dr. K.Anuradha (CSDS HOD)',
    roleTitle: 'CSDS HOD',
    department: 'CS-DS (Computer Science & Data Science)',
    departmentAliases: ['CSDS', 'CS-DS', 'CS-DS (Computer Science & Data Science)'],
    email: 'hod.csds@vignan.ac.in',
    phone: '+91 98481 10013'
  }
};

/**
 * Resolves which department aliases belong to a logged-in Department HOD
 */
function getDepartmentRegexForHOD(department = '', username = '') {
  const lowerUser = (username || '').toLowerCase();
  const lowerDept = (department || '').toLowerCase();

  if (lowerUser === 'mgmt_hod_admin' || lowerDept.includes('management') || lowerDept.includes('bba') || lowerDept.includes('mba') || lowerDept.includes('mca')) {
    return /Management|BBA|MBA|MCA/i;
  }
  if (lowerUser === 'estate_warden_admin' || lowerDept.includes('estate') || lowerDept.includes('hostel') || lowerDept.includes('warden')) {
    return /Estate|Hostel|Facilities|HVAC|Sanitation|Mess|Canteen|Transport|Electrical|Infrastructure|Mechanical/i;
  }
  if (lowerUser === 'cse_hod_admin' || lowerDept.startsWith('cse')) {
    return /CSE|Computer Science & Engineering/i;
  }
  if (lowerUser === 'it_network_admin' || lowerDept.includes('information technology') || lowerDept === 'it') {
    return /Information Technology|\bIT\b|IT & Network/i;
  }
  if (lowerUser === 'aiml_hod_admin' || lowerDept.includes('ai & ml') || lowerDept.includes('ai&ml') || lowerDept.includes('artificial intelligence')) {
    return /AI & ML|AI&ML|Artificial Intelligence/i;
  }
  if (lowerUser === 'cyber_hod_admin' || lowerDept.includes('cyber')) {
    return /Cyber Security|Cyber/i;
  }
  if (lowerUser === 'ece_hod_admin' || lowerDept.includes('ece') || lowerDept.includes('electronics')) {
    return /ECE|Electronics & Communication/i;
  }
  if (lowerUser === 'robotics_hod_admin' || lowerDept.includes('robotics')) {
    return /Robotics/i;
  }
  if (lowerUser === 'bibt_hod_admin' || lowerDept.includes('bi & bt') || lowerDept.includes('bio')) {
    return /BI & BT|BI&BT|Bio-Informatics|Bio-Technology/i;
  }
  if (lowerUser === 'foodtech_hod_admin' || lowerDept.includes('food')) {
    return /Food Technology/i;
  }
  if (lowerUser === 'textile_hod_admin' || lowerDept.includes('textile')) {
    return /Textile/i;
  }
  if (lowerUser === 'csbs_hod_admin' || lowerDept.includes('cs-bs') || lowerDept.includes('csbs') || lowerDept.includes('business systems')) {
    return /CS-BS|CSBS|Business Systems/i;
  }
  if (lowerUser === 'csds_hod_admin' || lowerDept.includes('cs-ds') || lowerDept.includes('csds') || lowerDept.includes('data science')) {
    return /CS-DS|CSDS|Data Science/i;
  }

  const cleanPattern = department.replace(/\s*\(.*?\)/, '').trim();
  return new RegExp(cleanPattern || 'General', 'i');
}

/**
 * Analyzes complaint fields and returns smart routing decision:
 * - targetDepartment
 * - assignedHOD (name, username, roleTitle)
 * - isRetainedBySuperAdmin (boolean)
 * - routingScope ('DEPT_HOD_ROUTED' | 'SUPERADMIN_RETAINED')
 * - routingReason (explanation string)
 * - escalationLevel
 * - slaHours
 */
function smartRouteGrievance(payload = {}) {
  const title = (payload.title || '').toLowerCase();
  const description = (payload.description || '').toLowerCase();
  const category = (payload.category || '').toLowerCase();
  const location = (payload.location || '').toLowerCase();
  const studentDept = (payload.studentDept || payload.department || '').toLowerCase();
  const urgency = (payload.urgency || payload.priority || 'medium').toLowerCase();
  const combinedText = `${title} ${description} ${category} ${location}`;

  // 1. Check SuperAdmin Retention & Escalation Rule (Cross-Departmental / Critical Safety / Beyond HOD Scope)
  const isCrossDeptOrExecutive = (
    combinedText.includes('ragging') ||
    combinedText.includes('harass') ||
    combinedText.includes('bully') ||
    combinedText.includes('cross-department') ||
    combinedText.includes('university policy') ||
    combinedText.includes('chancellor') ||
    combinedText.includes('dean') ||
    combinedText.includes('scholarship scam') ||
    combinedText.includes('beyond hod') ||
    combinedText.includes('security breach across campus') ||
    category.includes('harassment') ||
    category.includes('anti-ragging')
  );

  if (isCrossDeptOrExecutive) {
    return {
      targetDepartment: 'SuperAdmin Executive Desk',
      assignedHOD: {
        name: 'System Super Admin (K Sai Ganesh)',
        username: 'ksaiganesh64',
        role: 'Super Admin Executive Desk',
        department: 'All Departments',
        phone: '+91 9876543210'
      },
      isRetainedBySuperAdmin: true,
      routingScope: 'SUPERADMIN_RETAINED',
      routingReason: 'Retained by SuperAdmin: Critical / Cross-Departmental issue beyond individual HOD jurisdiction.',
      escalationLevel: 'LEVEL_2_DEAN',
      slaHours: 2
    };
  }

  // 2. Domain-Specific Smart Department HOD Auto-Assignment
  let matchedHOD = null;
  let routingReason = '';

  // AI & ML GPU / Deep Learning / ML Clusters
  if (
    combinedText.includes('gpu') ||
    combinedText.includes('cuda') ||
    combinedText.includes('rtx') ||
    combinedText.includes('deep learning') ||
    combinedText.includes('pytorch') ||
    combinedText.includes('tensorflow') ||
    combinedText.includes('neural network') ||
    combinedText.includes('ai lab') ||
    combinedText.includes('ml lab') ||
    combinedText.includes('ai & ml') ||
    combinedText.includes('ai&ml')
  ) {
    matchedHOD = HOD_DIRECTORY.AIML;
    routingReason = 'Auto-routed to AI & ML HOD: Detected AI/ML GPU cluster or deep learning lab infrastructure keywords.';
  }
  // Cyber Security Lab / Firewall / SOC
  else if (
    combinedText.includes('cyber') ||
    combinedText.includes('firewall') ||
    combinedText.includes('kali linux') ||
    combinedText.includes('soc lab') ||
    combinedText.includes('penetration') ||
    combinedText.includes('phishing') ||
    combinedText.includes('wireshark') ||
    combinedText.includes('cryptography')
  ) {
    matchedHOD = HOD_DIRECTORY.CYBER;
    routingReason = 'Auto-routed to Cyber Security HOD: Detected network security, firewall, or SOC lab keywords.';
  }
  // ECE Hardware / VLSI / Embedded / Oscilloscope / Circuit Boards
  else if (
    combinedText.includes('circuit board') ||
    combinedText.includes('oscilloscope') ||
    combinedText.includes('vlsi') ||
    combinedText.includes('embedded') ||
    combinedText.includes('microcontroller') ||
    combinedText.includes('microprocessor') ||
    combinedText.includes('fpga') ||
    combinedText.includes('soldering') ||
    combinedText.includes('signal generator') ||
    combinedText.includes('pcb') ||
    combinedText.includes('ece lab') ||
    combinedText.includes('verilog')
  ) {
    matchedHOD = HOD_DIRECTORY.ECE;
    routingReason = 'Auto-routed to ECE HOD: Detected electronics, circuit board, VLSI, or embedded lab instrumentation.';
  }
  // Robotics Lab / ROS / Actuators / Drones / 3D Printers
  else if (
    combinedText.includes('robot') ||
    combinedText.includes('actuator') ||
    combinedText.includes('servo') ||
    combinedText.includes('lidar') ||
    combinedText.includes('drone') ||
    combinedText.includes('3d print') ||
    combinedText.includes('kinematics') ||
    combinedText.includes('mechatronics')
  ) {
    matchedHOD = HOD_DIRECTORY.ROBOTICS;
    routingReason = 'Auto-routed to Robotics HOD: Detected robotics, actuators, drone, or mechatronics equipment.';
  }
  // CSE Lab Software / Compilers / Programming Lab
  else if (
    combinedText.includes('cse lab') ||
    combinedText.includes('compiler') ||
    combinedText.includes('programming lab') ||
    combinedText.includes('docker') ||
    combinedText.includes('vscode') ||
    combinedText.includes('visual studio') ||
    combinedText.includes('linux boot') ||
    combinedText.includes('java jdk') ||
    combinedText.includes('hackathon') ||
    combinedText.includes('algorithm')
  ) {
    matchedHOD = HOD_DIRECTORY.CSE;
    routingReason = 'Auto-routed to CSE HOD: Detected CSE programming lab software, IDE, or compiler environment issue.';
  }
  // IT & Campus Network / Wi-Fi / Routers / Portal / ERP
  else if (
    combinedText.includes('wi-fi') ||
    combinedText.includes('wifi') ||
    combinedText.includes('router') ||
    combinedText.includes('internet') ||
    combinedText.includes('ethernet') ||
    combinedText.includes('switch port') ||
    combinedText.includes('aruba') ||
    combinedText.includes('erp portal') ||
    combinedText.includes('lms') ||
    combinedText.includes('bandwidth') ||
    combinedText.includes('dns') ||
    combinedText.includes('it lab') ||
    category.includes('it & network')
  ) {
    matchedHOD = HOD_DIRECTORY.IT;
    routingReason = 'Auto-routed to IT & Network HOD: Detected campus Wi-Fi, optical network, router, or portal connectivity issue.';
  }
  // BI & BT Lab
  else if (
    combinedText.includes('biotech') ||
    combinedText.includes('bioinformatics') ||
    combinedText.includes('centrifuge') ||
    combinedText.includes('pcr') ||
    combinedText.includes('autoclave') ||
    combinedText.includes('microscope') ||
    combinedText.includes('bi&bt') ||
    combinedText.includes('bi & bt')
  ) {
    matchedHOD = HOD_DIRECTORY.BIBT;
    routingReason = 'Auto-routed to BI & BT HOD: Detected biotechnology or bioinformatics laboratory equipment.';
  }
  // Food Technology
  else if (
    combinedText.includes('food tech') ||
    combinedText.includes('pasteuriz') ||
    combinedText.includes('food processing') ||
    combinedText.includes('fermentation lab')
  ) {
    matchedHOD = HOD_DIRECTORY.FOOD;
    routingReason = 'Auto-routed to Food Technology HOD: Detected food processing or food technology lab issue.';
  }
  // Textile Industry
  else if (
    combinedText.includes('textile') ||
    combinedText.includes('weaving') ||
    combinedText.includes('spinning') ||
    combinedText.includes('loom') ||
    combinedText.includes('dyeing lab')
  ) {
    matchedHOD = HOD_DIRECTORY.TEXTILE;
    routingReason = 'Auto-routed to Textile Industry HOD: Detected textile machinery or fabric testing lab issue.';
  }
  // CSBS
  else if (
    combinedText.includes('csbs') ||
    combinedText.includes('cs-bs') ||
    combinedText.includes('business systems')
  ) {
    matchedHOD = HOD_DIRECTORY.CSBS;
    routingReason = 'Auto-routed to CSBS HOD: Detected Computer Science & Business Systems academic/lab issue.';
  }
  // CSDS
  else if (
    combinedText.includes('csds') ||
    combinedText.includes('cs-ds') ||
    combinedText.includes('data science') ||
    combinedText.includes('hadoop') ||
    combinedText.includes('spark cluster') ||
    combinedText.includes('tableau')
  ) {
    matchedHOD = HOD_DIRECTORY.CSDS;
    routingReason = 'Auto-routed to CSDS HOD: Detected Data Science cluster or analytics lab issue.';
  }
  // Management (BBA / MBA / MCA)
  else if (
    combinedText.includes('bba') ||
    combinedText.includes('mba') ||
    combinedText.includes('mca') ||
    combinedText.includes('management block') ||
    combinedText.includes('case study') ||
    combinedText.includes('business administration')
  ) {
    matchedHOD = HOD_DIRECTORY.MGMT;
    routingReason = 'Auto-routed to Management (BBA/MBA/MCA) HOD: Detected Management school academic or facility issue.';
  }
  // Estate & Hostel Warden (Hostel, Mess, Canteen, Transport, Electrical, Plumbing, Water, Sanitation)
  else if (
    combinedText.includes('hostel') ||
    combinedText.includes('mess') ||
    combinedText.includes('canteen') ||
    combinedText.includes('food quality') ||
    combinedText.includes('dining') ||
    combinedText.includes('water cooler') ||
    combinedText.includes('ro water') ||
    combinedText.includes('plumbing') ||
    combinedText.includes('washroom') ||
    combinedText.includes('sanitation') ||
    combinedText.includes('air condition') ||
    combinedText.includes('ac breakdown') ||
    combinedText.includes('ceiling fan') ||
    combinedText.includes('switchboard') ||
    combinedText.includes('electrical') ||
    combinedText.includes('power backup') ||
    combinedText.includes('generator') ||
    combinedText.includes('bus ') ||
    combinedText.includes('transport') ||
    category.includes('hostel') ||
    category.includes('canteen') ||
    category.includes('mess') ||
    category.includes('transport') ||
    category.includes('infrastructure') ||
    category.includes('electrical') ||
    category.includes('sanitation')
  ) {
    matchedHOD = HOD_DIRECTORY.ESTATE;
    routingReason = 'Auto-routed to Estate & Hostel Warden: Detected hostel, mess, transport, or campus estate infrastructure issue.';
  }

  // 3. Fallback to Student's Department HOD for general Academic / Exam / Library / Faculty tickets
  if (!matchedHOD) {
    if (studentDept.includes('cse')) matchedHOD = HOD_DIRECTORY.CSE;
    else if (studentDept.includes('ai') || studentDept.includes('ml')) matchedHOD = HOD_DIRECTORY.AIML;
    else if (studentDept.includes('cyber')) matchedHOD = HOD_DIRECTORY.CYBER;
    else if (studentDept.includes('ece')) matchedHOD = HOD_DIRECTORY.ECE;
    else if (studentDept.includes('robot')) matchedHOD = HOD_DIRECTORY.ROBOTICS;
    else if (studentDept.includes('bi')) matchedHOD = HOD_DIRECTORY.BIBT;
    else if (studentDept.includes('food')) matchedHOD = HOD_DIRECTORY.FOOD;
    else if (studentDept.includes('textile')) matchedHOD = HOD_DIRECTORY.TEXTILE;
    else if (studentDept.includes('cs-bs') || studentDept.includes('csbs')) matchedHOD = HOD_DIRECTORY.CSBS;
    else if (studentDept.includes('cs-ds') || studentDept.includes('csds')) matchedHOD = HOD_DIRECTORY.CSDS;
    else if (studentDept.includes('bba') || studentDept.includes('mba') || studentDept.includes('mca') || studentDept.includes('management')) matchedHOD = HOD_DIRECTORY.MGMT;
    else matchedHOD = HOD_DIRECTORY.IT;

    routingReason = `Auto-routed to ${matchedHOD.roleTitle} based on student department & academic category.`;
  }

  const slaHoursMap = { critical: 2, urgent: 4, high: 8, medium: 24, low: 48 };
  const slaHours = slaHoursMap[urgency] || 24;

  return {
    targetDepartment: matchedHOD.department,
    assignedHOD: {
      name: matchedHOD.name,
      username: matchedHOD.username,
      role: matchedHOD.roleTitle,
      department: matchedHOD.department,
      phone: matchedHOD.phone
    },
    isRetainedBySuperAdmin: false,
    routingScope: 'DEPT_HOD_ROUTED',
    routingReason,
    escalationLevel: 'LEVEL_1_HOD',
    slaHours
  };
}

module.exports = {
  UNIVERSITY_DEPARTMENTS,
  HOD_DIRECTORY,
  getDepartmentRegexForHOD,
  smartRouteGrievance
};

