const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { HOD_DIRECTORY, smartRouteGrievance } = require('../services/smartRoutingService');

const FOURTEEN_DEPARTMENTS = [
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
  'MCA (Master of Computer Applications)'
];

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aaryan', 'Dhruv', 'Kabir', 'Ritvik', 'Harshith',
  'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Myra', 'Pari', 'Anika', 'Navya', 'lasya',
  'Keerthi', 'Sneha', 'Pooja', 'Kavya', 'Bhavya', 'Swathi', 'Divya', 'Nithya', 'Meghana', 'Harini',
  'Karthik', 'Teja', 'Rohit', 'Vikram', 'Nikhil', 'Surya', 'Chaitanya', 'Manoj', 'Deepak', 'Varun'
];

const LAST_NAMES = [
  'Reddy', 'Rao', 'Naidu', 'Sharma', 'Verma', 'Patel', 'Chowdary', 'Varma', 'Kumar', 'Goud',
  'Raju', 'Murthy', 'Sastry', 'Nair', 'Iyer', 'joshi', 'Kulkarni', 'Desai', 'Mehta', 'Babu'
];

function buildTimeline(status, createdDate, assignedNote, progressNote, resolvedNote) {
  const s = (status || '').toLowerCase();
  const isAssigned = ['assigned', 'in progress', 'investigating', 'dispatched', 'pending student verification', 'resolved'].includes(s);
  const isInProgress = ['in progress', 'investigating', 'dispatched', 'pending student verification', 'resolved'].includes(s);
  const isResolved = s === 'resolved';

  return [
    {
      stepKey: 'submitted',
      title: 'Submitted',
      timestamp: createdDate,
      completed: true,
      note: 'Grievance logged & triaged by SuperAdmin Smart Routing Engine'
    },
    {
      stepKey: 'assigned',
      title: 'Assigned to Department HOD',
      timestamp: isAssigned ? new Date(createdDate.getTime() + 1800000) : null,
      completed: isAssigned,
      note: assignedNote || 'Routed to Department HOD queue'
    },
    {
      stepKey: 'in_progress',
      title: 'Under Investigation & Action',
      timestamp: isInProgress ? new Date(createdDate.getTime() + 7200000) : null,
      completed: isInProgress,
      note: progressNote || 'Field technician inspection in progress'
    },
    {
      stepKey: 'resolved',
      title: 'Resolved & Verified',
      timestamp: isResolved ? new Date(createdDate.getTime() + 21600000) : null,
      completed: isResolved,
      note: resolvedNote || (s === 'pending student verification' ? 'Resolved with proof — awaiting student verification' : 'Resolution verified and signed off')
    }
  ];
}

// ── 20 Diverse, Realistic Complaints for Student 241FA07011 ──────────────────
const STUDENT_241FA07011_COMPLAINTS = [
  {
    id: 'RH-7011-01',
    title: 'Docker Engine & GCC Compiler License Failure in CSE Programming Lab 3',
    category: 'IT/Lab Infrastructure',
    location: 'NTR Tech Block, CSE Lab 3, Systems 14-28',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'high',
    priority: 'High',
    status: 'In Progress',
    daysAgo: 1,
    description: 'Docker daemon and GCC 13 compiler environment on Systems 14 to 28 in CSE Lab 3 are failing due to expired root certificates, blocking our Full-Stack & OS practical exam preparation.'
  },
  {
    id: 'RH-7011-02',
    title: 'NVIDIA RTX A6000 GPU Cluster Node Thermal Throttling in AI & ML Lab',
    category: 'Academic',
    location: 'AI Research Center, Deep Learning Lab 2',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'critical',
    priority: 'Urgent',
    status: 'Assigned',
    daysAgo: 1,
    description: 'CUDA multi-GPU training jobs on the AI & ML Lab cluster node-02 are crashing at 93°C due to cooling fan failure during our neural network capstone training.'
  },
  {
    id: 'RH-7011-03',
    title: 'Aruba 5GHz Enterprise Wi-Fi Access Point Offline on 3rd Floor IT Wing',
    category: 'IT/Lab Infrastructure',
    location: 'IT Block, 3rd Floor Corridor & Lab 302',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'high',
    priority: 'High',
    status: 'Pending Student Verification',
    daysAgo: 2,
    description: 'Campus Wi-Fi router (Aruba AP-515) in the IT 3rd floor wing is blinking amber with DHCP timeout errors. Students cannot access the LMS portal or cloud repositories.',
    proofRemarks: 'Replaced faulty PoE injector on switch port Gi1/0/18 and verified 350 Mbps throughput on Aruba AP-515. Please verify connectivity.'
  },
  {
    id: 'RH-7011-04',
    title: 'Air Conditioning & Ceiling Fan Regulator Fault in NTR Mens Hostel Room 312',
    category: 'Hostel',
    location: 'NTR Mens Hostel, Block B, Room 312',
    hostelBlock: 'NTR Mens Hostel',
    zone: 'Hostels',
    urgency: 'medium',
    priority: 'Medium',
    status: 'In Progress',
    daysAgo: 2,
    description: 'Ceiling fan capacitor burned out and split AC unit is leaking condensation water onto the study desk in NTR Mens Hostel Block B Room 312.'
  },
  {
    id: 'RH-7011-05',
    title: 'RO Drinking Water Cooler TDS Level High (390 PPM) in Hostel Block A',
    category: 'Hostel',
    location: 'Hostel Block A, 2nd Floor North Wing Water Station',
    hostelBlock: 'Hostel Block A',
    zone: 'Hostels',
    urgency: 'high',
    priority: 'High',
    status: 'Resolved',
    daysAgo: 5,
    description: 'The BlueStar RO water dispenser on the 2nd floor of Hostel Block A is dispensing warm water with metallic taste and TDS reading above 390 PPM.',
    proofRemarks: 'Replaced RO sediment & activated carbon membranes; post-service TDS verified at 48 PPM.'
  },
  {
    id: 'RH-7011-06',
    title: 'Guntur–Vadlamudi Route 14 Morning Campus Bus Severe Overcrowding & Delay',
    category: 'Transport',
    location: 'Bus Route 14 (Lakshmipuram - Guntur to Main Gate)',
    hostelBlock: 'General / Campus',
    zone: 'Transport',
    urgency: 'high',
    priority: 'High',
    status: 'Assigned',
    daysAgo: 2,
    description: 'Bus Route 14 arriving at Lakshmipuram stop 25 minutes late every morning and carrying 75+ students beyond seating capacity, causing students to miss 1st hour lectures.'
  },
  {
    id: 'RH-7011-07',
    title: 'Central Mess Dining Hall B Steam Boiler & Dinner Hygiene Inspection Request',
    category: 'Mess',
    location: 'Central Mess Facility B, Ground Floor Dining Hall',
    hostelBlock: 'NTR Mens Hostel',
    zone: 'Food',
    urgency: 'medium',
    priority: 'Medium',
    status: 'Pending Student Verification',
    daysAgo: 3,
    description: 'Rice steam boiler in Central Mess Dining Hall B is under-cooking batches during peak 8:00 PM dinner hours and plate sterilization hot-water unit needs servicing.',
    proofRemarks: 'Mess steam pressure valve recalibrated and high-temperature dish sterilizer restored to 82°C. Verified by Mess Warden.'
  },
  {
    id: 'RH-7011-08',
    title: 'Three-Phase UPS Power Backup Tripping in Academic Block 2 Seminar Hall',
    category: 'Electrical',
    location: 'Academic Complex 2, Seminar Hall 204',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'high',
    priority: 'High',
    status: 'Resolved',
    daysAgo: 6,
    description: 'Main 20kVA online UPS breaker trips whenever the laser projector and podium audio amplifier are powered simultaneously in Seminar Hall 204.',
    proofRemarks: 'Balanced 3-phase load distribution across MCB panel B2 and replaced faulty 32A Schneider breaker.'
  },
  {
    id: 'RH-7011-09',
    title: 'Central Library 2nd Floor Digital Reading Room IEEE Xplore Proxy & Power Sockets',
    category: 'Library',
    location: 'Central Library, 2nd Floor Digital Reference Zone',
    hostelBlock: 'Library & Admin Block',
    zone: 'Library',
    urgency: 'medium',
    priority: 'Medium',
    status: 'Resolved',
    daysAgo: 7,
    description: 'Institutional SSO proxy for IEEE Xplore and ACM Digital Library is returning 403 Forbidden on library terminals, and 6 laptop charging sockets at Table 4 are loose.',
    proofRemarks: 'Updated static IP whitelist with IEEE institutional proxy and replaced modular 16A sockets at Reading Table 4.'
  },
  {
    id: 'RH-7011-10',
    title: 'Digital Storage Oscilloscope & FPGA JTAG Cable Fault in ECE VLSI Lab',
    category: 'Academic',
    location: 'ECE Block, VLSI & Embedded Systems Lab (Room 108)',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'medium',
    priority: 'Medium',
    status: 'In Progress',
    daysAgo: 3,
    description: 'Four Tektronix 100MHz Digital Storage Oscilloscopes and Xilinx Artix-7 FPGA JTAG programming cables on Workbench 3 are not detecting target circuit boards.'
  },
  {
    id: 'RH-7011-11',
    title: 'Cyber Security SOC Lab Kali Linux VM Sandbox Firewall Blocking Packet Capture',
    category: 'IT/Lab Infrastructure',
    location: 'Cyber Security Center, SOC Lab 104',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'medium',
    priority: 'Medium',
    status: 'Assigned',
    daysAgo: 2,
    description: 'Internal VLAN firewall in the Cyber Security SOC lab is dropping promiscuous mode packets on the isolated Wireshark & penetration testing sandbox subnet.'
  },
  {
    id: 'RH-7011-12',
    title: 'Robotics & Mechatronics Lab Prusa 3D Printer Extruder Jam & LiDAR Calibration',
    category: 'Academic',
    location: 'Robotics Innovation Lab, Ground Floor Workshop',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'low',
    priority: 'Low',
    status: 'Submitted',
    daysAgo: 1,
    description: 'Dual-extruder 3D printer nozzle is clogged with PLA filament and the ROS2 Slamtec LiDAR sensor unit requires firmware recalibration for our autonomous rover project.'
  },
  {
    id: 'RH-7011-13',
    title: 'Mid-Semester Internal Assessment Marks Portal Sync Discrepancy (IT Dept)',
    category: 'Academic',
    location: 'IT Department Examination Cell Portal',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'high',
    priority: 'High',
    status: 'Resolved',
    daysAgo: 8,
    description: 'Mid-1 practical lab internal marks for Database Management Systems (DBMS) are showing as "Not Entered" on the student ERP portal despite faculty uploading the sheet.',
    proofRemarks: 'Re-synced ERP examination schema batch #IT-2026-M1; DBMS lab internal marks are now visible on student dashboard.'
  },
  {
    id: 'RH-7011-14',
    title: 'Hostel Block B 3rd Floor Corridor LED Streetlight & Geyser Thermostat Failure',
    category: 'Electrical',
    location: 'NTR Mens Hostel, Block B, 3rd Floor North Washroom',
    hostelBlock: 'NTR Mens Hostel',
    zone: 'Hostels',
    urgency: 'medium',
    priority: 'Medium',
    status: 'In Progress',
    daysAgo: 2,
    description: 'Solar hot-water geyser booster thermostat in Block B 3rd floor washroom is not heating water in the morning, and two corridor emergency LED tubelights are flickering.'
  },
  {
    id: 'RH-7011-15',
    title: 'Tenali–Vignan Evening Return Bus (5:15 PM) Departure Bay Allocation Confusion',
    category: 'Transport',
    location: 'Campus Transport Bay 2, Main Parking Lot',
    hostelBlock: 'General / Campus',
    zone: 'Transport',
    urgency: 'low',
    priority: 'Low',
    status: 'Resolved',
    daysAgo: 9,
    description: 'Evening return buses to Tenali (Routes 21 & 22) change parking bays without announcement, causing students from lab sessions to miss the 5:15 PM departure.',
    proofRemarks: 'Fixed permanent Bay 2A & 2B signage boards for Tenali Routes 21 & 22 and enabled automated PA announcement at 5:05 PM.'
  },
  {
    id: 'RH-7011-16',
    title: 'Campus Food Court UPI QR Scanner Terminal & Ventilation Exhaust Fan Issue',
    category: 'Mess',
    location: 'Main Campus Canteen & Food Court',
    hostelBlock: 'General / Campus',
    zone: 'Food',
    urgency: 'low',
    priority: 'Low',
    status: 'Resolved',
    daysAgo: 10,
    description: 'Digital token kiosk #2 at the main canteen fails to print coupons after UPI payment deduction, and two ceiling exhaust fans near the juice counter are noisy.',
    proofRemarks: 'Updated Razorpay POS webhook timeout on Kiosk #2 and lubricated exhaust fan bearings.'
  },
  {
    id: 'RH-7011-17',
    title: 'Central Library Overnight Exam Study Hours Extension & Reference Book Restock',
    category: 'Library',
    location: 'Central Library, 1st Floor Lending Section',
    hostelBlock: 'Library & Admin Block',
    zone: 'Library',
    urgency: 'medium',
    priority: 'Medium',
    status: 'Assigned',
    daysAgo: 1,
    description: 'All 18 copies of "Operating System Concepts (Silberschatz)" and "Computer Networks (Tanenbaum)" are checked out ahead of mid-exams; requesting reserve reference copies.'
  },
  {
    id: 'RH-7011-18',
    title: 'Hostel High-Speed Fiber Switch Packet Loss During Evening Coding Contests (9 PM)',
    category: 'IT/Lab Infrastructure',
    location: 'NTR Mens Hostel, Wing C Distribution Switch',
    hostelBlock: 'NTR Mens Hostel',
    zone: 'Hostels',
    urgency: 'high',
    priority: 'High',
    status: 'In Progress',
    daysAgo: 1,
    description: 'Severe 35% packet loss and 400ms ping spikes on NTR Hostel Wing C Wi-Fi between 8:30 PM and 11:00 PM during LeetCode and Codeforces rated contests.'
  },
  {
    id: 'RH-7011-19',
    title: 'Cross-Departmental Hackathon Overnight Lab Access & Campus Security Clearance',
    category: 'Academic',
    location: 'Central Innovation Hub & All Engineering Blocks',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'critical',
    priority: 'Urgent',
    status: 'Under Review',
    daysAgo: 1,
    description: 'Cross-department university policy approval needed from Dean & SuperAdmin for 24-hour overnight lab access, hostel curfews, and security passes for 120 Smart India Hackathon finalists.'
  },
  {
    id: 'RH-7011-20',
    title: 'Smart Classroom HDMI Matrix Switcher & Wireless Collar Mic Battery Replacement',
    category: 'Electrical',
    location: 'IT Block, Smart Classroom LH-201',
    hostelBlock: 'Academic Complex',
    zone: 'Academic',
    urgency: 'medium',
    priority: 'Medium',
    status: 'Pending Student Verification',
    daysAgo: 2,
    description: 'Epson interactive projector HDMI wall-plate port in LH-201 disconnects intermittently when faculty connect laptops, and the Sennheiser wireless lapel mic has static.',
    proofRemarks: 'Replaced HDMI 2.1 active optical cable and installed new rechargeable AA cells in the LH-201 podium receiver.'
  }
];

// ── Multi-Student Sample Complaints across all 14 Departments ────────────────
const MULTI_STUDENT_SAMPLE_TEMPLATES = [
  {
    regNo: '241FA07012',
    dept: 'CSE (Computer Science & Engineering)',
    title: 'Kubernetes & Cloud Computing Lab Cluster Quota Limit in CSE Block',
    category: 'IT & Network',
    location: 'CSE Block, Cloud Lab 401',
    urgency: 'high',
    status: 'In Progress',
    description: 'CSE Cloud Lab Kubernetes worker nodes are out of memory during distributed microservices lab session; need CSE lab admin to expand VM RAM allocation.'
  },
  {
    regNo: '241FA07015',
    dept: 'Information Technology (IT)',
    title: 'Campus ERP Attendance Portal SSL Certificate Warning on Mobile Browsers',
    category: 'IT & Network',
    location: 'IT Server Room / Student ERP Portal',
    urgency: 'high',
    status: 'Resolved',
    description: 'Students accessing the Vignan IT ERP portal over campus Wi-Fi receive an intermediate SSL chain warning on Android Chrome browsers.'
  },
  {
    regNo: '241FA07018',
    dept: 'AI & ML (Artificial Intelligence & Machine Learning)',
    title: 'PyTorch 2.4 & cuDNN 9 Environment Upgrade on AI & ML Workstation Cluster',
    category: 'Academic',
    location: 'AI & ML Research Lab, 2nd Floor',
    urgency: 'medium',
    status: 'Assigned',
    description: 'Workstations 01-15 in the AI & ML Lab have mismatched NVIDIA driver 525 and cuDNN versions, preventing HuggingFace LLM fine-tuning scripts from executing.'
  },
  {
    regNo: '241FA07022',
    dept: 'Cyber Security',
    title: 'Cyber Security SOC Lab SIEM Splunk License Renewal & Firewall Rule Update',
    category: 'IT & Network',
    location: 'Cyber Security Lab 202',
    urgency: 'high',
    status: 'In Progress',
    description: 'Splunk Enterprise academic license in the Cyber Security SOC lab expired yesterday, halting real-time intrusion detection lab exercises.'
  },
  {
    regNo: '241FA07026',
    dept: 'ECE (Electronics & Communication Engineering)',
    title: 'Spectrum Analyzer & PCB Etching Machine Maintenance in ECE Microwave Lab',
    category: 'Academic',
    location: 'ECE Block, Microwave & Communication Lab',
    urgency: 'medium',
    status: 'Assigned',
    description: 'RF Spectrum Analyzer probe attenuation is miscalibrated at 2.4GHz and the rapid PCB prototyping drill chuck in the ECE lab needs replacement.'
  },
  {
    regNo: '241FA07030',
    dept: 'BI & BT (Bio-Informatics & Bio-Technology)',
    title: 'Refrigerated High-Speed Centrifuge & PCR Thermal Cycler Calibration in Biotech Lab',
    category: 'Academic',
    location: 'BI & BT Block, Molecular Biology Lab 102',
    urgency: 'high',
    status: 'In Progress',
    description: 'Eppendorf refrigerated centrifuge in the BI & BT lab is showing rotor imbalance error E-14 and the PCR thermal cycler lid heater needs calibration.'
  },
  {
    regNo: '241FA07034',
    dept: 'Robotics',
    title: '6-DOF Industrial Robotic Arm Servo Controller & ROS Gazebo Workstation Issue',
    category: 'Academic',
    location: 'Robotics & Automation Center, Lab 1',
    urgency: 'high',
    status: 'Assigned',
    description: 'Joint-3 harmonic drive actuator on the 6-DOF teaching robotic arm is triggering over-current protection during inverse kinematics trajectory testing.'
  },
  {
    regNo: '241FA07038',
    dept: 'Food Technology',
    title: 'Pilot Spray Dryer & Pasteurization Unit Temperature Sensor Fault in Food Tech Lab',
    category: 'Academic',
    location: 'Food Technology Block, Pilot Processing Plant',
    urgency: 'medium',
    status: 'Pending Student Verification',
    description: 'PT100 RTD temperature probe on the Food Technology batch pasteurization unit is drifting by +6°C during dairy processing practicals.'
  },
  {
    regNo: '241FA07042',
    dept: 'Textile Industry',
    title: 'Air-Jet Weaving Loom & Fabric Tensile Strength Tester Maintenance in Textile Lab',
    category: 'Academic',
    location: 'Textile Technology Block, Weaving Studio',
    urgency: 'medium',
    status: 'In Progress',
    description: 'Pneumatic weft insertion pressure on the air-jet weaving loom in the Textile Industry lab drops below 4 bar and universal tensile tester load cell needs zeroing.'
  },
  {
    regNo: '241FA07046',
    dept: 'CS-BS (Computer Science & Business Systems)',
    title: 'SAP ERP & FinTech Analytics Sandbox Access for CSBS 3rd Year Batch',
    category: 'Academic',
    location: 'CSBS Enterprise Systems Lab 305',
    urgency: 'medium',
    status: 'Resolved',
    description: 'CS-BS students require active student credentials for the SAP S/4HANA academic sandbox and Bloomberg financial data terminal in Lab 305.'
  },
  {
    regNo: '241FA07050',
    dept: 'CS-DS (Computer Science & Data Science)',
    title: 'Apache Spark & Hadoop HDFS NameNode Disk Full in CSDS Big Data Lab',
    category: 'IT & Network',
    location: 'CSDS Big Data Analytics Lab 308',
    urgency: 'high',
    status: 'In Progress',
    description: 'HDFS NameNode storage partition in the CS-DS Data Science cluster is at 98% capacity, causing PySpark streaming jobs and Tableau server extracts to fail.'
  },
  {
    regNo: '241FA07054',
    dept: 'BBA (Bachelor of Business Administration)',
    title: 'Management Block Harvard Business Case Study Portal Access & Projector Audio',
    category: 'Academic',
    location: 'Management Block, BBA Seminar Hall 101',
    urgency: 'medium',
    status: 'Assigned',
    description: 'BBA students unable to download assigned Harvard Business Publishing case PDFs via institutional login, and Seminar Hall 101 podium mic has echo.'
  },
  {
    regNo: '241FA07058',
    dept: 'MBA (Master of Business Administration)',
    title: 'MBA Corporate Boardroom Video Conferencing & SPSS License Activation',
    category: 'Academic',
    location: 'Management School, MBA Analytics Lab 202',
    urgency: 'high',
    status: 'Pending Student Verification',
    description: 'IBM SPSS Statistics 29 network license server in the MBA Analytics Lab is rejecting concurrent logins during marketing research project evaluations.'
  },
  {
    regNo: '241FA07062',
    dept: 'MCA (Master of Computer Applications)',
    title: 'MCA Full-Stack DevOps Lab Jenkins & PostgreSQL Server Port Conflict',
    category: 'IT & Network',
    location: 'Management & MCA Block, Lab 304',
    urgency: 'medium',
    status: 'Resolved',
    description: 'Central PostgreSQL 16 database server and Jenkins CI runner in MCA Lab 304 are unreachable from lab subnet 10.20.4.x after weekend switch maintenance.'
  },
  {
    regNo: '241FA07066',
    dept: 'CSE (Computer Science & Engineering)',
    title: 'Priyadarshini Girls Hostel Block A Solar Water Heater & Washing Machine Repair',
    category: 'Hostel & Facilities',
    location: 'Priyadarshini Girls Hostel, Block A, 2nd Floor',
    urgency: 'high',
    status: 'In Progress',
    description: 'Two IFB commercial front-load washing machines in Priyadarshini Girls Hostel Block A laundry wing are showing drain error E03 and hot water line is cold.'
  },
  {
    regNo: '241FA07072',
    dept: 'ECE (Electronics & Communication Engineering)',
    title: 'Cross-Departmental Anti-Ragging & Late-Evening Campus Shuttle Safety Escort',
    category: 'Harassment & Discipline',
    location: 'Main Gate to Hostel Blocks Corridor',
    urgency: 'critical',
    status: 'Under Review',
    description: 'Requesting executive SuperAdmin & Dean directive for dedicated security patrol and 9:30 PM shuttle bus from Central Library to Girls & Boys Hostels.'
  },
  {
    regNo: '241FA07078',
    dept: 'AI & ML (Artificial Intelligence & Machine Learning)',
    title: 'Hostel Mess South & North Indian Counter Queue Congestion During Lunch Break',
    category: 'Canteen & Food',
    location: 'Central Mess Hall A',
    urgency: 'medium',
    status: 'Assigned',
    description: 'Between 12:30 PM and 1:20 PM lunch break, only two serving counters are open in Mess Hall A, causing 25-minute queues before afternoon lab sessions.'
  },
  {
    regNo: '241FA07085',
    dept: 'Cyber Security',
    title: 'Vijayawada–Vignan Express Bus Route 04 AC Blower & Fastag Toll Delay',
    category: 'Transport',
    location: 'Bus Route 04 (Benz Circle Vijayawada)',
    urgency: 'medium',
    status: 'Resolved',
    description: 'Bus Route 04 from Benz Circle had a weak AC blower in the rear rows and Fastag balance issue at Kaza Toll Plaza; requesting immediate transport check.'
  },
  {
    regNo: '241FA07092',
    dept: 'Robotics',
    title: 'Outdoor Sports Complex Floodlight Tower 2 & Badminton Court Mat Maintenance',
    category: 'Infrastructure & Maintenance',
    location: 'University Sports Complex, Court 2',
    urgency: 'low',
    status: 'Assigned',
    description: 'Halogen floodlight bank on Tower 2 of the outdoor volleyball & cricket ground is not turning on at 6:00 PM, and indoor badminton synthetic mat edge needs taping.'
  },
  {
    regNo: '241FA07105',
    dept: 'Information Technology (IT)',
    title: 'University Scholarship Renewal Bonafide Certificate Bulk Approval Delay',
    category: 'Administration & Certificates',
    location: 'Admin Block, Scholarship Desk Counter 2',
    urgency: 'critical',
    status: 'Under Review',
    description: 'Cross-department scholarship renewal bonafide certificates for 80+ NSP and Jnanabhumi applicants need urgent Registrar & SuperAdmin digital signature before Friday.'
  }
];

async function seedDatabase() {
  const superUsername = (process.env.SUPERADMIN_USERNAME || 'ksaiganesh64').trim().toLowerCase();
  const superPassword = process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611';

  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const primaryURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  let closeDb = false;
  if (mongoose.connection.readyState !== 1) {
    try {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 4000 });
      closeDb = true;
    } catch (e) {
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/resolvehub', { serverSelectionTimeoutMS: 4000 });
        closeDb = true;
      } catch (localErr) {
        console.error('⚠️ Could not connect to MongoDB for seeding. Continuing...');
        return;
      }
    }
  }

  const Staff = require('../models/Staff');
  const User = require('../models/User');
  const SignupRequest = require('../models/SignupRequest');
  const Ticket = require('../models/Ticket');
  const SystemSetting = require('../models/SystemSetting');

  // ── 0. Ensure System Settings have all 14+ Departments ────────────────────
  await SystemSetting.findOneAndUpdate(
    { key: 'global_settings' },
    {
      $set: {
        key: 'global_settings',
        categories: [
          'Academic',
          'Hostel',
          'IT/Lab Infrastructure',
          'Transport',
          'Mess',
          'Electrical',
          'Library',
          'Hostel & Facilities',
          'IT & Network',
          'Canteen & Food',
          'Examinations',
          'Security & Safety',
          'Placements & Training',
          'Infrastructure & Maintenance',
          'Administration & Certificates',
          'Harassment & Discipline',
          'Others'
        ],
        departments: [
          ...FOURTEEN_DEPARTMENTS,
          'Management (BBA / MBA / MCA)',
          'Estate & Hostel Management'
        ],
        priorities: ['Low', 'Medium', 'High', 'Urgent'],
        slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
      }
    },
    { upsert: true }
  );

  // ── 1. Preserve Super Admin Account (NEVER overwrite if already exists) ───
  const existingAdmin = await Staff.findOne({ username: superUsername });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash(superPassword, 10);
    await Staff.create({
      id: 'admin-super-01',
      username: superUsername,
      passwordHash: adminHash,
      name: 'System Super Admin (Sai Ganesh)',
      role: 'super_admin',
      department: 'All Departments',
      status: 'ACTIVE',
      createdAt: new Date().toLocaleString('en-IN')
    });
    console.log(`✅ Super Admin account created: ${superUsername}`);
  } else {
    console.log(`🔒 Super Admin account preserved untouched: ${superUsername}`);
  }

  // ── 2. Preserve Student 241FA07011 (CRITICAL RULE: DO NOT MODIFY IF EXISTS) ─
  const targetReg = '241FA07011';
  let existingStudent = await User.findOne({ regNo: targetReg });
  if (!existingStudent) {
    const studentHash = await bcrypt.hash('241FA07011', 10);
    existingStudent = await User.create({
      id: 'usr-241fa07011',
      regNo: targetReg,
      fullName: 'K Sai Ganesh',
      email: 'ksaiganesh64@vignan.ac.in',
      phone: '+91 9876543210',
      department: 'Information Technology (IT)',
      year: '2nd Year',
      passwordHash: studentHash,
      mustChangePassword: false,
      status: 'ACTIVE',
      activatedAt: new Date().toLocaleString('en-IN')
    });
    console.log(`✅ Student account 241FA07011 created.`);
  } else {
    console.log(`🔒 Student 241FA07011 credentials & profile preserved untouched.`);
  }

  const existingReq = await SignupRequest.findOne({ regNo: targetReg });
  if (!existingReq) {
    await SignupRequest.create({
      id: 'req-241fa07011',
      regNo: targetReg,
      fullName: existingStudent.fullName || 'K Sai Ganesh',
      email: existingStudent.email || 'ksaiganesh64@vignan.ac.in',
      phone: existingStudent.phone || '+91 9876543210',
      department: existingStudent.department || 'Information Technology (IT)',
      year: existingStudent.year || '2nd Year',
      passwordHash: existingStudent.passwordHash,
      status: 'APPROVED',
      rejectionReason: null,
      createdAt: new Date().toLocaleString('en-IN')
    });
  }

  // ── 3. Seed All Department HOD Admin Credentials (TASK 2) ─────────────────
  const hodEntries = Object.values(HOD_DIRECTORY);
  for (const hod of hodEntries) {
    const existingHod = await Staff.findOne({ username: hod.username });
    const hodHash = await bcrypt.hash(hod.passwordPlain, 8);
    if (!existingHod) {
      await Staff.create({
        id: hod.id,
        username: hod.username,
        passwordHash: hodHash,
        name: hod.name,
        email: hod.email,
        phone: hod.phone,
        role: 'dept_admin',
        department: hod.department,
        status: 'ACTIVE',
        createdAt: new Date().toLocaleString('en-IN')
      });
    } else {
      existingHod.passwordHash = hodHash;
      existingHod.name = hod.name;
      existingHod.department = hod.department;
      existingHod.role = 'dept_admin';
      existingHod.status = 'ACTIVE';
      await existingHod.save();
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                 🏛️  VIGNAN RESOLVEHUB — DEPARTMENT HOD & ADMIN CREDENTIALS               ║');
  console.log('╠══════════════════════════════════╦═══════════════════════╦═══════════════════════════════╣');
  console.log('║ Department / Role                ║ Username              ║ Password                      ║');
  console.log('╠══════════════════════════════════╬═══════════════════════╬═══════════════════════════════╣');
  console.log('║ CSE HOD Admin                    ║ cse_hod_admin         ║ VignanCSE@2026                ║');
  console.log('║ IT & Network HOD                 ║ it_network_admin      ║ VignanIT@2026                 ║');
  console.log('║ AI & ML HOD                      ║ aiml_hod_admin        ║ VignanAIML@2026               ║');
  console.log('║ Cyber Security HOD               ║ cyber_hod_admin       ║ VignanCyber@2026              ║');
  console.log('║ ECE HOD Admin                    ║ ece_hod_admin         ║ VignanECE@2026                ║');
  console.log('║ Robotics HOD                     ║ robotics_hod_admin    ║ VignanRobotics@2026           ║');
  console.log('║ Management (BBA/MBA/MCA) HOD     ║ mgmt_hod_admin        ║ VignanMgmt@2026               ║');
  console.log('║ Estate & Hostel Warden           ║ estate_warden_admin   ║ VignanEstate@2026             ║');
  console.log('║ BI & BT HOD                      ║ bibt_hod_admin        ║ VignanBIBT@2026               ║');
  console.log('║ Food Technology HOD              ║ foodtech_hod_admin    ║ VignanFood@2026               ║');
  console.log('║ Textile Industry HOD             ║ textile_hod_admin     ║ VignanTextile@2026            ║');
  console.log('║ CSBS HOD                         ║ csbs_hod_admin        ║ VignanCSBS@2026               ║');
  console.log('║ CSDS HOD                         ║ csds_hod_admin        ║ VignanCSDS@2026               ║');
  console.log('╚══════════════════════════════════╩═══════════════════════╩═══════════════════════════════╝\n');

  // ── 4. Seed Sample Student Range 241FA07012 to 241FA07200 (189 Students) ──
  const existingSampleRegs = new Set(
    (await User.find({ regNo: { $gte: '241FA07012', $lte: '241FA07200' } }, 'regNo').lean()).map(u => u.regNo)
  );
  const existingReqRegs = new Set(
    (await SignupRequest.find({ regNo: { $gte: '241FA07012', $lte: '241FA07200' } }, 'regNo').lean()).map(r => r.regNo)
  );

  const usersToInsert = [];
  const reqsToInsert = [];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  for (let num = 7012; num <= 7200; num++) {
    const regNo = `241FA0${num}`;
    const idx = num - 7012;
    const firstName = FIRST_NAMES[idx % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(idx + Math.floor(idx / FIRST_NAMES.length)) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const dept = FOURTEEN_DEPARTMENTS[idx % FOURTEEN_DEPARTMENTS.length];
    const year = years[idx % years.length];
    const email = `${regNo.toLowerCase()}@vignan.ac.in`;
    const phone = `+91 9848${String(100000 + idx).slice(-6)}`;

    if (!existingSampleRegs.has(regNo)) {
      const pwdHash = await bcrypt.hash(regNo, 6);
      usersToInsert.push({
        id: `usr-${regNo.toLowerCase()}`,
        regNo,
        fullName,
        email,
        phone,
        department: dept,
        year,
        passwordHash: pwdHash,
        mustChangePassword: false,
        status: 'ACTIVE',
        activatedAt: new Date().toLocaleString('en-IN')
      });

      if (!existingReqRegs.has(regNo)) {
        reqsToInsert.push({
          id: `req-${regNo.toLowerCase()}`,
          regNo,
          fullName,
          email,
          phone,
          department: dept,
          year,
          passwordHash: pwdHash,
          status: 'APPROVED',
          rejectionReason: null,
          createdAt: new Date().toLocaleString('en-IN')
        });
      }
    }
  }

  if (usersToInsert.length > 0) {
    await User.insertMany(usersToInsert, { ordered: false }).catch(() => {});
    console.log(`✅ Seeded ${usersToInsert.length} student accounts (Range: 241FA07012 – 241FA07200)`);
  } else {
    console.log(`ℹ️ All 189 student accounts (241FA07012 – 241FA07200) are already active.`);
  }

  if (reqsToInsert.length > 0) {
    await SignupRequest.insertMany(reqsToInsert, { ordered: false }).catch(() => {});
  }

  // ── 5. Seed 20 Diverse Realistic Complaints for Student 241FA07011 ─────────
  const student7011Name = existingStudent.fullName || 'K Sai Ganesh';
  const student7011Email = existingStudent.email || 'ksaiganesh64@vignan.ac.in';
  const student7011Dept = existingStudent.department || 'Information Technology (IT)';

  let seeded7011Count = 0;
  for (const item of STUDENT_241FA07011_COMPLAINTS) {
    const routing = smartRouteGrievance({
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location,
      studentDept: student7011Dept,
      urgency: item.urgency
    });

    const createdDate = new Date(Date.now() - (item.daysAgo || 1) * 24 * 60 * 60 * 1000);
    const createdStr = createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
      createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const slaDeadline = new Date(createdDate.getTime() + (routing.slaHours || 24) * 60 * 60 * 1000);

    const targetDept = routing.isRetainedBySuperAdmin ? 'SuperAdmin Executive Desk' : routing.targetDepartment;
    const remarks = item.proofRemarks || routing.routingReason;

    const ticketDoc = {
      id: item.id,
      title: item.title,
      category: item.category,
      department: targetDept,
      urgency: item.urgency,
      priority: item.priority,
      status: item.status,
      slaStatus: item.urgency === 'critical' ? 'warning' : 'normal',
      isAnonymous: false,
      zone: item.zone || 'Academic',
      hostelBlock: item.hostelBlock || 'Academic Complex',
      location: item.location,
      description: item.description,
      aiSuggestedCategory: item.category,
      aiSuggestedPriority: item.priority,
      aiSuggestedDept: targetDept,
      isRetainedBySuperAdmin: routing.isRetainedBySuperAdmin,
      routingScope: routing.routingScope,
      routingReason: routing.routingReason,
      escalationLevel: routing.escalationLevel,
      slaDeadline,
      resolutionProof: item.status === 'Pending Student Verification' || item.status === 'Resolved' ? {
        remarks: item.proofRemarks || 'Resolved and verified by Department HOD.',
        proofUrl: '',
        resolvedByHOD: routing.assignedHOD.name,
        resolvedAt: createdStr,
        verifiedByStudent: item.status === 'Resolved',
        studentVerifiedAt: item.status === 'Resolved' ? createdStr : ''
      } : undefined,
      timeline: buildTimeline(
        item.status,
        createdDate,
        `Auto-routed to ${routing.assignedHOD.name}`,
        `Field action initiated by ${routing.assignedHOD.role}`,
        item.proofRemarks
      ),
      complainant: {
        regNo: '241FA07011',
        name: student7011Name,
        email: student7011Email,
        role: 'Student',
        department: student7011Dept
      },
      submittedBy: `Reg No: 241FA07011 (${student7011Email})`,
      assignedAgent: routing.assignedHOD,
      responseRemarks: remarks,
      eta: item.status === 'Resolved' ? 'Resolved' : `${routing.slaHours || 24} Hours (SLA Target)`,
      etaMinutesLeft: item.status === 'Resolved' ? 0 : (routing.slaHours || 24) * 60,
      submittedAt: createdStr,
      createdAt: createdStr,
      updatedAt: createdStr,
      rating: item.status === 'Resolved' ? 5 : 0,
      ratingFeedback: item.status === 'Resolved' ? 'Prompt resolution by the department technical team.' : '',
      attachments: [],
      auditLogs: [
        {
          id: `log-route-${item.id}`,
          timestamp: createdStr,
          author: 'SuperAdmin Smart Triage Engine',
          role: 'Automated Triage Bot',
          action: routing.isRetainedBySuperAdmin ? 'Retained by SuperAdmin' : `Smart Routed -> ${routing.assignedHOD.role}`,
          note: routing.routingReason
        },
        {
          id: `log-sub-${item.id}`,
          timestamp: createdStr,
          author: `${student7011Name} (241FA07011)`,
          role: 'Student',
          action: 'Complaint Logged',
          note: `Submitted under ${item.category} (${item.priority} Priority).`
        }
      ]
    };

    await Ticket.findOneAndUpdate(
      { id: item.id },
      { $set: ticketDoc },
      { upsert: true, returnDocument: 'after' }
    );
    seeded7011Count++;
  }
  console.log(`✅ Seeded ${seeded7011Count} diverse grievances for Student 241FA07011.`);

  // ── 6. Seed Multi-Student Complaints (241FA07012 – 241FA07200) Across All 14 Depts ─
  let multiSeededCount = 0;
  for (let i = 0; i < MULTI_STUDENT_SAMPLE_TEMPLATES.length; i++) {
    const tpl = MULTI_STUDENT_SAMPLE_TEMPLATES[i];
    const ticketId = `RH-81${String(i + 1).padStart(2, '0')}`;
    const studentUser = await User.findOne({ regNo: tpl.regNo }).lean();
    const sName = studentUser?.fullName || `Student ${tpl.regNo}`;
    const sEmail = studentUser?.email || `${tpl.regNo.toLowerCase()}@vignan.ac.in`;
    const sDept = studentUser?.department || tpl.dept;

    const routing = smartRouteGrievance({
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      location: tpl.location,
      studentDept: sDept,
      urgency: tpl.urgency
    });

    const daysAgo = (i % 7) + 1;
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const createdStr = createdDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
      createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const targetDept = routing.isRetainedBySuperAdmin ? 'SuperAdmin Executive Desk' : routing.targetDepartment;

    const ticketDoc = {
      id: ticketId,
      title: tpl.title,
      category: tpl.category,
      department: targetDept,
      urgency: tpl.urgency,
      priority: tpl.urgency === 'critical' ? 'Urgent' : (tpl.urgency === 'high' ? 'High' : 'Medium'),
      status: tpl.status,
      slaStatus: tpl.urgency === 'critical' ? 'warning' : 'normal',
      isAnonymous: false,
      zone: 'Academic',
      hostelBlock: 'Academic Complex',
      location: tpl.location,
      description: tpl.description,
      aiSuggestedCategory: tpl.category,
      aiSuggestedPriority: tpl.urgency === 'critical' ? 'Urgent' : 'High',
      aiSuggestedDept: targetDept,
      isRetainedBySuperAdmin: routing.isRetainedBySuperAdmin,
      routingScope: routing.routingScope,
      routingReason: routing.routingReason,
      escalationLevel: routing.escalationLevel,
      slaDeadline: new Date(createdDate.getTime() + (routing.slaHours || 24) * 60 * 60 * 1000),
      timeline: buildTimeline(
        tpl.status,
        createdDate,
        `Auto-routed to ${routing.assignedHOD.name}`,
        `Assigned to ${routing.assignedHOD.role} specialist team`,
        'Verified by Department HOD'
      ),
      complainant: {
        regNo: tpl.regNo,
        name: sName,
        email: sEmail,
        role: 'Student',
        department: sDept
      },
      submittedBy: `Reg No: ${tpl.regNo} (${sEmail})`,
      assignedAgent: routing.assignedHOD,
      responseRemarks: routing.routingReason,
      eta: `${routing.slaHours || 24} Hours (SLA Target)`,
      etaMinutesLeft: (routing.slaHours || 24) * 60,
      submittedAt: createdStr,
      createdAt: createdStr,
      updatedAt: createdStr,
      attachments: [],
      auditLogs: [
        {
          id: `log-route-${ticketId}`,
          timestamp: createdStr,
          author: 'SuperAdmin Smart Triage Engine',
          role: 'Automated Triage Bot',
          action: routing.isRetainedBySuperAdmin ? 'Retained by SuperAdmin' : `Smart Routed -> ${routing.assignedHOD.role}`,
          note: routing.routingReason
        },
        {
          id: `log-sub-${ticketId}`,
          timestamp: createdStr,
          author: `${sName} (${tpl.regNo})`,
          role: 'Student',
          action: 'Complaint Logged',
          note: `Logged under ${tpl.category}`
        }
      ]
    };

    await Ticket.findOneAndUpdate(
      { id: ticketId },
      { $set: ticketDoc },
      { upsert: true, returnDocument: 'after' }
    );
    multiSeededCount++;
  }
  console.log(`✅ Seeded ${multiSeededCount} multi-student grievances across all 14 University Departments.`);

  if (closeDb) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('✨ ResolveHub comprehensive database seed completed.');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Seed script error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
