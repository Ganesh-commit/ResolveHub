const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { smartRouteGrievance } = require('../services/smartRoutingService');

const SERVER_JSON_PATH = path.join(__dirname, '..', 'data', 'resolvehub.json');
const ROOT_JSON_PATH = path.join(__dirname, '..', '..', 'data', 'resolvehub.json');

// ── 48 UNIQUE VIGNAN STUDENTS (241FA07001..241FA07040 + 231FA07xxx + 251FA07xxx) ──
const STUDENTS_DATA = [
  { regNo: '241FA07001', fullName: 'Aarav Sharma', dept: 'CSE (Computer Science & Engineering)', year: '2nd Year', phone: '9848011001' },
  { regNo: '241FA07002', fullName: 'Bhavya Sri Reddy', dept: 'Information Technology (IT)', year: '2nd Year', phone: '9848011002' },
  { regNo: '241FA07003', fullName: 'Chaitanya Kumar Varma', dept: 'AI & ML (Artificial Intelligence & Machine Learning)', year: '2nd Year', phone: '9848011003' },
  { regNo: '241FA07004', fullName: 'Divya Darshini Naidu', dept: 'ECE (Electronics & Communication Engineering)', year: '2nd Year', phone: '9848011004' },
  { regNo: '241FA07005', fullName: 'Eshwar Prasad Rao', dept: 'Cyber Security', year: '2nd Year', phone: '9848011005' },
  { regNo: '241FA07006', fullName: 'Farhan Ahmed Khan', dept: 'Robotics', year: '2nd Year', phone: '9848011006' },
  { regNo: '241FA07007', fullName: 'Gayathri Devi Chowdary', dept: 'CS-DS (Computer Science & Data Science)', year: '2nd Year', phone: '9848011007' },
  { regNo: '241FA07008', fullName: 'Harsha Vardhan Goud', dept: 'CSE (Computer Science & Engineering)', year: '2nd Year', phone: '9848011008' },
  { regNo: '241FA07009', fullName: 'Indu Priya Kamineni', dept: 'BI & BT (Bio-Informatics & Bio-Technology)', year: '2nd Year', phone: '9848011009' },
  { regNo: '241FA07010', fullName: 'Jayanth BabuMaddineni', dept: 'Information Technology (IT)', year: '2nd Year', phone: '9848011010' },
  // ── USER'S PRIMARY ACCOUNT (241FA07011 / 241FA07011) ──
  { regNo: '241FA07011', fullName: 'Katabattula Venkata SivaSai Ganesh', dept: 'Information Technology (IT)', year: '2nd Year', phone: '9876543211' },
  { regNo: '241FA07012', fullName: 'Lakshmi Narayana Murthy', dept: 'CSE (Computer Science & Engineering)', year: '2nd Year', phone: '9848011012' },
  { regNo: '241FA07013', fullName: 'Meghana Sree Yarlagadda', dept: 'AI & ML (Artificial Intelligence & Machine Learning)', year: '2nd Year', phone: '9848011013' },
  { regNo: '241FA07014', fullName: 'Nikhil Teja Daggubati', dept: 'ECE (Electronics & Communication Engineering)', year: '2nd Year', phone: '9848011014' },
  { regNo: '241FA07015', fullName: 'Omkar Nath Bezawada', dept: 'Cyber Security', year: '2nd Year', phone: '9848011015' },
  { regNo: '241FA07016', fullName: 'Pranavi Chowdary Alapati', dept: 'CS-BS (Computer Science & Business Systems)', year: '2nd Year', phone: '9848011016' },
  { regNo: '241FA07017', fullName: 'Rakesh Roshan Pentapati', dept: 'Food Technology', year: '2nd Year', phone: '9848011017' },
  { regNo: '241FA07018', fullName: 'Sahithi Priya Velagapudi', dept: 'CSE (Computer Science & Engineering)', year: '2nd Year', phone: '9848011018' },
  { regNo: '241FA07019', fullName: 'Tarun Sai Nallamothu', dept: 'Robotics', year: '2nd Year', phone: '9848011019' },
  { regNo: '241FA07020', fullName: 'Uma Maheswari Devi', dept: 'Information Technology (IT)', year: '2nd Year', phone: '9848011020' },
  { regNo: '241FA07021', fullName: 'Vamsi Krishna Koneru', dept: 'CSE (Computer Science & Engineering)', year: '2nd Year', phone: '9848011021' },
  { regNo: '241FA07022', fullName: 'Yaswanth Kumar Gutta', dept: 'AI & ML (Artificial Intelligence & Machine Learning)', year: '2nd Year', phone: '9848011022' },
  { regNo: '241FA07023', fullName: 'Zoya Fathima Shaik', dept: 'BBA (Bachelor of Business Administration)', year: '2nd Year', phone: '9848011023' },
  { regNo: '241FA07024', fullName: 'Abhinav Siddharth P', dept: 'ECE (Electronics & Communication Engineering)', year: '2nd Year', phone: '9848011024' },
  { regNo: '241FA07025', fullName: 'Bindu Madhavi Bollineni', dept: 'Textile Industry', year: '2nd Year', phone: '9848011025' },
  { regNo: '241FA07026', fullName: 'Charan TejaDevineni', dept: 'CS-DS (Computer Science & Data Science)', year: '2nd Year', phone: '9848011026' },
  { regNo: '241FA07027', fullName: 'Deepika Rani Mullapudi', dept: 'MBA (Master of Business Administration)', year: '2nd Year', phone: '9848011027' },
  { regNo: '241FA07028', fullName: 'Goutham Raju Gottipati', dept: 'Cyber Security', year: '2nd Year', phone: '9848011028' },
  { regNo: '241FA07029', fullName: 'Hema Latha Kommineni', dept: 'MCA (Master of Computer Applications)', year: '2nd Year', phone: '9848011029' },
  { regNo: '241FA07030', fullName: 'Karthikeya Sharma V', dept: 'CSE (Computer Science & Engineering)', year: '2nd Year', phone: '9848011030' },
  { regNo: '241FA07031', fullName: 'Lavanya Kumari Pilli', dept: 'Information Technology (IT)', year: '2nd Year', phone: '9848011031' },
  { regNo: '241FA07032', fullName: 'Manoj Kumar Chintala', dept: 'Robotics', year: '2nd Year', phone: '9848011032' },
  { regNo: '241FA07033', fullName: 'Navya Sri Doppalapudi', dept: 'BI & BT (Bio-Informatics & Bio-Technology)', year: '2nd Year', phone: '9848011033' },
  { regNo: '241FA07034', fullName: 'Pavan Kalyan Gogineni', dept: 'ECE (Electronics & Communication Engineering)', year: '2nd Year', phone: '9848011034' },
  { regNo: '241FA07035', fullName: 'Revathi Nandan T', dept: 'Food Technology', year: '2nd Year', phone: '9848011035' },
  { regNo: '241FA07036', fullName: 'Srinivasulu Reddy K', dept: 'CS-BS (Computer Science & Business Systems)', year: '2nd Year', phone: '9848011036' },
  { regNo: '241FA07037', fullName: 'Tejaswini Rao Valluri', dept: 'AI & ML (Artificial Intelligence & Machine Learning)', year: '2nd Year', phone: '9848011037' },
  { regNo: '241FA07038', fullName: 'Uday Kiran Mandava', dept: 'CSE (Computer Science & Engineering)', year: '2nd Year', phone: '9848011038' },
  { regNo: '241FA07039', fullName: 'Varshini Chowdary K', dept: 'Information Technology (IT)', year: '2nd Year', phone: '9848011039' },
  { regNo: '241FA07040', fullName: 'Venkatesh Prabhu M', dept: 'Cyber Security', year: '2nd Year', phone: '9848011040' },
  // ── 231FA07xxx SENIOR BATCH STUDENTS ──
  { regNo: '231FA07004', fullName: 'Siddharth Verma Ankineedu', dept: 'CSE (Computer Science & Engineering)', year: '3rd Year', phone: '9848023004' },
  { regNo: '231FA07015', fullName: 'Ananya Roy Kodali', dept: 'AI & ML (Artificial Intelligence & Machine Learning)', year: '3rd Year', phone: '9848023015' },
  { regNo: '231FA07027', fullName: 'Rohit Shetty Bandaru', dept: 'ECE (Electronics & Communication Engineering)', year: '3rd Year', phone: '9848023027' },
  { regNo: '231FA07038', fullName: 'Keerthana Suresh P', dept: 'Information Technology (IT)', year: '3rd Year', phone: '9848023038' },
  // ── 251FA07xxx FRESHER BATCH STUDENTS ──
  { regNo: '251FA07002', fullName: 'Aditya Narayan Pemmasani', dept: 'CSE (Computer Science & Engineering)', year: '1st Year', phone: '9848025002' },
  { regNo: '251FA07014', fullName: 'Sneha Latha Gadde', dept: 'CS-DS (Computer Science & Data Science)', year: '1st Year', phone: '9848025014' },
  { regNo: '251FA07026', fullName: 'Kiran KumarParitala', dept: 'Robotics', year: '1st Year', phone: '9848025026' },
  { regNo: '251FA07035', fullName: 'Pooja Hegde Lingamaneni', dept: 'Information Technology (IT)', year: '1st Year', phone: '9848025035' }
];

// ── 68 REALISTIC, UNIQUE COMPLAINTS SPREAD OVER AUG–OCT 2026 ──
// Every single one of the 48 students above has at least 1 complaint; 241FA07011 has 6 complaints; several others have 2–3 complaints.
const RAW_COMPLAINTS = [
  // ── 6 COMPLAINTS BY 241FA07011 (Katabattula Venkata SivaSai Ganesh) ──
  {
    id: 'RP-1011',
    regNo: '241FA07011',
    title: 'Cisco Packet Tracer & Docker Daemon License Expired in IT Lab 3',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'In Progress',
    location: 'Sangamam Block - IT Lab 3',
    hostelBlock: 'Academic Complex',
    dateStr: '27 Oct 2026, 10:15 am',
    isoDate: '2026-10-27T10:15:00.000Z',
    description: 'During our Computer Networks practical session in Sangamam Block IT Lab 3, over 25 Ubuntu workstations failed to start Docker containers and Cisco Packet Tracer threw a license expiration error. Our lab internal exam is scheduled next week.',
    remarks: 'IT Systems Engineer dispatched to renew institutional Cisco NetAcad token and restart Docker daemon across Lab 3 images.'
  },
  {
    id: 'RP-1012',
    regNo: '241FA07011',
    title: 'RO Drinking Water Cooler Dispensing Warm Water on 3rd Floor NTR Hostel',
    category: 'Hostel & Facilities',
    priority: 'Urgent',
    status: 'Pending',
    location: 'NTR Mens Hostel - Block B, 3rd Floor',
    hostelBlock: 'NTR Mens Hostel',
    dateStr: '26 Oct 2026, 07:40 pm',
    isoDate: '2026-10-26T19:40:00.000Z',
    description: 'The Blue Star RO water cooler near Room 312 in NTR Mens Hostel Block B has stopped cooling and the filter indicator light is blinking red continuously. Around 80 students on the 3rd floor depend on this unit for drinking water.',
    remarks: 'Logged and assigned to Estate & Hostel Maintenance team for compressor and RO membrane replacement.'
  },
  {
    id: 'RP-1013',
    regNo: '241FA07011',
    title: 'Late Evening Bus Route #14 (Guntur Bus Stand) Overcrowding at 5:15 PM',
    category: 'Transport',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Main Transport Bay - Guntur Route #14',
    hostelBlock: 'General / Campus',
    dateStr: '14 Oct 2026, 05:30 pm',
    isoDate: '2026-10-14T17:30:00.000Z',
    description: 'After special coding club sessions end at 5:00 PM, Bus #14 towards Guntur Bus Stand is completely packed with over 20 students standing in the aisle. Requesting an additional relief bus on Tuesdays and Thursdays at 5:15 PM.',
    remarks: 'Transport Officer allocated Spare Bus AP-07-TZ-4418 for the 5:15 PM Guntur trip on Tue/Thu. Verified and closed.'
  },
  {
    id: 'RP-1014',
    regNo: '241FA07011',
    title: 'Mid-Term 1 Operating Systems Answer Script Totaling Discrepancy',
    category: 'Examinations',
    priority: 'High',
    status: 'Resolved',
    location: 'Examination Cell - A Block',
    hostelBlock: 'Academic Complex',
    dateStr: '29 Sep 2026, 11:20 am',
    isoDate: '2026-09-29T11:20:00.000Z',
    description: 'In my Mid-1 Operating Systems theory script, Question 4b (Bankers Algorithm) was awarded 6 marks inside the booklet, but the online ERP portal reflects only 21/30 instead of 27/30. I have attached the booklet scan copy for recounting.',
    remarks: 'Controller of Examinations verified script totaling; ERP portal marks updated from 21 to 27/30.'
  },
  {
    id: 'RP-1015',
    regNo: '241FA07011',
    title: 'IEEE Xplore & Springer Digital Library Off-Campus Proxy Login Error',
    category: 'Library',
    priority: 'Low',
    status: 'In Progress',
    location: 'Central Library Digital Resource Center',
    hostelBlock: 'Library & Admin Block',
    dateStr: '19 Oct 2026, 03:10 pm',
    isoDate: '2026-10-19T15:10:00.000Z',
    description: 'When trying to access IEEE Xplore research papers using our Vignan Knimbus remote library login from the hostel network, the Shibboleth SSO certificate throws an SSL handshake error.',
    remarks: 'Chief Librarian escalated SSL certificate renewal ticket to Knimbus technical support.'
  },
  {
    id: 'RP-1016',
    regNo: '241FA07011',
    title: 'Request to Waive Late Library Book Return Fine Due to Medical Leave',
    category: 'Finance & Scholarship',
    priority: 'Low',
    status: 'Rejected',
    location: 'Student Finance Counter - Admin Block',
    hostelBlock: 'Library & Admin Block',
    dateStr: '08 Sep 2026, 02:05 pm',
    isoDate: '2026-09-08T14:05:00.000Z',
    description: 'I was charged Rs. 140 overdue fine for returning "Designing Data-Intensive Applications" 14 days late. I was at home with viral fever for 4 days and request a full waiver.',
    remarks: 'Rejected after review: Online renewal via the OPAC portal was available during leave period as per library bylaws.'
  },

  // ── COMPLAINTS ACROSS ALL OTHER 47 STUDENTS (RP-1017 to RP-1078) ──
  {
    id: 'RP-1017',
    regNo: '241FA07001',
    title: 'Ceiling Fan Regulator Burnt Out in NTR Boys Hostel Room 204',
    category: 'Electrical',
    priority: 'High',
    status: 'Resolved',
    location: 'NTR Mens Hostel - Block A, Room 204',
    hostelBlock: 'Hostel Block A',
    dateStr: '25 Oct 2026, 09:15 am',
    isoDate: '2026-10-25T09:15:00.000Z',
    description: 'The electronic step regulator for the ceiling fan in Room 204 sparked last night and emitted a burning plastic smell. We have turned off the room MCB switch for safety.',
    remarks: 'Campus electrician replaced faulty regulator with new Anchor modular dimmer and tested wiring.'
  },
  {
    id: 'RP-1018',
    regNo: '241FA07002',
    title: 'Frequent Wi-Fi Disconnections in Priyadarshini Girls Hostel Wing C',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'In Progress',
    location: 'Priyadarshini Girls Hostel - 2nd Floor Wing C',
    hostelBlock: 'Priyadarshini Girls Hostel',
    dateStr: '26 Oct 2026, 08:45 pm',
    isoDate: '2026-10-26T20:45:00.000Z',
    description: 'The Aruba access point in Wing C corridor keeps rebooting every 15 minutes between 7 PM and 11 PM, making it impossible to attend NPTEL live mentoring sessions.',
    remarks: 'Network team identified PoE switch port power fluctuation; replacement switch scheduled.'
  },
  {
    id: 'RP-1019',
    regNo: '241FA07003',
    title: 'CUDA Drivers & PyTorch Mismatch on AI & ML GPU Server Node 02',
    category: 'Academics',
    priority: 'Urgent',
    status: 'In Progress',
    location: 'AI & ML Deep Learning Lab - H Block',
    hostelBlock: 'Academic Complex',
    dateStr: '27 Oct 2026, 11:05 am',
    isoDate: '2026-10-27T11:05:00.000Z',
    description: 'NVIDIA driver version 535 on GPU Server Node 02 is incompatible with CUDA 12.4 required for our final year Computer Vision project training runs. Jobs crash with CUDA initialization error.',
    remarks: 'AI & ML HOD approved driver upgrade to 550.54 during tonight maintenance window.'
  },
  {
    id: 'RP-1020',
    regNo: '241FA07004',
    title: 'Digital Storage Oscilloscopes Missing Probes in VLSI & Embedded Lab',
    category: 'Academics',
    priority: 'Medium',
    status: 'Pending',
    location: 'ECE Block - VLSI Lab 2nd Floor',
    hostelBlock: 'Academic Complex',
    dateStr: '24 Oct 2026, 02:30 pm',
    isoDate: '2026-10-24T14:30:00.000Z',
    description: 'Six out of fifteen Tektronix Digital Storage Oscilloscopes in the VLSI & Signal Processing Lab have broken BNC attenuation probes, forcing three batches to share a single bench.',
    remarks: 'Assigned to ECE Lab In-Charge for immediate probe replacement from central store.'
  },
  {
    id: 'RP-1021',
    regNo: '241FA07005',
    title: 'Kali Linux Virtual Machine Templates Corrupted in Cyber Range Lab',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'Resolved',
    location: 'Cyber Security Lab - Sangamam 4th Floor',
    hostelBlock: 'Academic Complex',
    dateStr: '12 Oct 2026, 10:00 am',
    isoDate: '2026-10-12T10:00:00.000Z',
    description: 'The base VMwareOVA image for Kali Linux 2026.2 on the local NAS server has a corrupted virtual disk header, preventing students from launching penetration testing sandbox environments.',
    remarks: 'Cyber Security Lab Administrator re-uploaded verified SHA256 OVA image to local NAS.'
  },
  {
    id: 'RP-1022',
    regNo: '241FA07006',
    title: ' burned Servo Motor Drivers on 6-DOF Robotic Arm Kit #3',
    category: 'Academics',
    priority: 'High',
    status: 'In Progress',
    location: 'Robotics & Automation Center - Workshop Block',
    hostelBlock: 'Academic Complex',
    dateStr: '23 Oct 2026, 04:15 pm',
    isoDate: '2026-10-23T16:15:00.000Z',
    description: 'Two Dynamixel servo driver modules on Robotic Arm Kit #3 suffered over-voltage damage during inverse kinematics testing. We need replacement drivers before the inter-university Robocon qualifier.',
    remarks: 'Robotics HOD requisitioned 4 replacement Dynamixel shield boards via express vendor delivery.'
  },
  {
    id: 'RP-1023',
    regNo: '241FA07007',
    title: 'Undercooked Rice and Cold Sambar Served at Annapurna Mess Dinner',
    category: 'Mess & Dining',
    priority: 'High',
    status: 'Resolved',
    location: 'Annapurna Central Dining Hall',
    hostelBlock: 'Hostel Block B',
    dateStr: '18 Oct 2026, 08:20 pm',
    isoDate: '2026-10-18T20:20:00.000Z',
    description: 'For the past three evenings, the steamed rice served after 8:00 PM in Annapurna Mess is half-cooked and the sambar is completely cold. Batch-2 students finishing lab at 7:45 PM are getting poor quality food.',
    remarks: 'Chief Warden & Mess Committee inspected steam boilers and enforced fresh batch cooking at 7:45 PM.'
  },
  {
    id: 'RP-1024',
    regNo: '241FA07008',
    title: 'Projector HDMI Port Loose Connection in CSE Seminar Hall H-302',
    category: 'Infrastructure & Maintenance',
    priority: 'Medium',
    status: 'Resolved',
    location: 'H-Block - Classroom H-302',
    hostelBlock: 'Academic Complex',
    dateStr: '05 Oct 2026, 11:40 am',
    isoDate: '2026-10-05T11:40:00.000Z',
    description: 'The wall-mounted HDMI faceplate in Classroom H-302 has a bent pin, causing the Epson ceiling projector screen to flicker purple during Design & Analysis of Algorithms lectures.',
    remarks: 'AV Maintenance technician replaced HDMI wall socket and installed a heavy-duty 4K braided cable.'
  },
  {
    id: 'RP-1025',
    regNo: '241FA07009',
    title: 'PCR Thermal Cycler Lid Heating Failure in Molecular Biology Lab',
    category: 'Academics',
    priority: 'Urgent',
    status: 'In Progress',
    location: 'BI & BT Block - Wet Lab 1',
    hostelBlock: 'Academic Complex',
    dateStr: '25 Oct 2026, 01:50 pm',
    isoDate: '2026-10-25T13:50:00.000Z',
    description: 'The Bio-Rad PCR thermal cycler heated lid is not reaching 105°C, causing condensation in DNA amplification tubes and ruining our 5th-semester Genetic Engineering lab samples.',
    remarks: 'Bio-Technology lab technician logged service call with Bio-Rad authorized engineer.'
  },
  {
    id: 'RP-1026',
    regNo: '241FA07010',
    title: 'Jnanabhumi Tuition Fee Reimbursement Receipt Not Updated in ERP',
    category: 'Finance & Scholarship',
    priority: 'High',
    status: 'Pending',
    location: 'Accounts & Scholarship Cell - Admin Block',
    hostelBlock: 'Library & Admin Block',
    dateStr: '27 Oct 2026, 09:50 am',
    isoDate: '2026-10-27T09:50:00.000Z',
    description: 'My Jnanabhumi scholarship tranche of Rs. 35,000 was credited on 15th October and I submitted the bank acknowledgement slip, but my ERP portal still shows a fee due block preventing exam registration.',
    remarks: 'Forwarded to Student Finance Bureau for bank scroll reconciliation.'
  },
  {
    id: 'RP-1027',
    regNo: '241FA07012',
    title: 'Broken Window Mosquito Mesh in NTR Hostel Block C Room 118',
    category: 'Hostel & Facilities',
    priority: 'Medium',
    status: 'Resolved',
    location: 'NTR Mens Hostel - Block C, Room 118',
    hostelBlock: 'Hostel Block C',
    dateStr: '10 Sep 2026, 04:00 pm',
    isoDate: '2026-09-10T16:00:00.000Z',
    description: 'The aluminum mosquito mesh frame on the east window of Room 118 is torn completely, leading to severe mosquito menace every evening after 6 PM.',
    remarks: 'Carpentry unit installed new stainless-steel mesh frame in Room 118.'
  },
  {
    id: 'RP-1028',
    regNo: '241FA07013',
    title: 'Insufficient Copies of "Deep Learning by Ian Goodfellow" in Central Library',
    category: 'Library',
    priority: 'Low',
    status: 'Pending',
    location: 'Central Library - Reference Section 1st Floor',
    hostelBlock: 'Library & Admin Block',
    dateStr: '21 Oct 2026, 12:15 pm',
    isoDate: '2026-10-21T12:15:00.000Z',
    description: 'There are only 3 lending copies of "Deep Learning" by Goodfellow & Bengio for over 180 AI & ML students. Please procure at least 15 additional copies or enable OReilly Safari campus license.',
    remarks: 'Added to Library Book Acquisition Committee October purchase list.'
  },
  {
    id: 'RP-1029',
    regNo: '241FA07014',
    title: 'Bus #07 (Tenali Route) AC Blower Leaking Water Over Front Seats',
    category: 'Transport',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Tenali Route Bus #07',
    hostelBlock: 'General / Campus',
    dateStr: '22 Oct 2026, 08:30 am',
    isoDate: '2026-10-22T08:30:00.000Z',
    description: 'Water condenses and drips continuously from the overhead AC duct above seats 3 and 4 in Tenali Bus #07 during the morning commute, soaking our backpacks and record books.',
    remarks: 'Transport garage mechanics scheduled AC drain pipe cleaning this Saturday.'
  },
  {
    id: 'RP-1030',
    regNo: '241FA07015',
    title: 'Washroom Exhaust Fan and Liquid Soap Dispensers Broken in Sangamam 2nd Floor',
    category: 'Sanitation & Hygiene',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Sangamam Academic Block - 2nd Floor Restroom',
    hostelBlock: 'Academic Complex',
    dateStr: '02 Oct 2026, 01:10 pm',
    isoDate: '2026-10-02T13:10:00.000Z',
    description: 'The exhaust fan in the 2nd floor boys washroom of Sangamam Block is not working and all three wall-mounted soap dispensers are empty and broken.',
    remarks: 'Housekeeping supervisor replaced soap dispensers and electrical team fixed the exhaust fan.'
  },
  {
    id: 'RP-1031',
    regNo: '241FA07016',
    title: 'Clash Between Business Analytics Elective and Coding Placement Training Slot',
    category: 'Academics',
    priority: 'High',
    status: 'Resolved',
    location: 'CS-BS Department Timetable Cell',
    hostelBlock: 'Academic Complex',
    dateStr: '15 Sep 2026, 10:45 am',
    isoDate: '2026-09-15T10:45:00.000Z',
    description: 'Our CS-BS 2nd year timetable has Financial Modeling scheduled on Wednesdays 2:00-4:00 PM, which directly overlaps with the mandatory T&P competitive coding session in the auditorium.',
    remarks: 'Academic Coordinator shifted Financial Modeling slot to Thursday 11:00 AM.'
  },
  {
    id: 'RP-1032',
    regNo: '241FA07017',
    title: 'Cold Storage Walk-in Chiller Thermostat Fluctuating in Food Processing Lab',
    category: 'Infrastructure & Maintenance',
    priority: 'High',
    status: 'In Progress',
    location: 'Food Technology Pilot Plant - Ground Floor',
    hostelBlock: 'Academic Complex',
    dateStr: '24 Oct 2026, 03:45 pm',
    isoDate: '2026-10-24T15:45:00.000Z',
    description: 'The walk-in cold room temperature in the Food Preservation Pilot Plant is rising to 14°C instead of holding steady at 4°C, risking spoilage of dairy fermentation batches.',
    remarks: 'HVAC refrigeration specialist inspecting expansion valve and refrigerant pressure.'
  },
  {
    id: 'RP-1033',
    regNo: '241FA07018',
    title: 'Biometric Attendance Terminal Not Recognizing Fingerprints Outside H-201',
    category: 'IT & Wi-Fi',
    priority: 'Medium',
    status: 'Pending',
    location: 'H-Block - 2nd Floor Corridor',
    hostelBlock: 'Academic Complex',
    dateStr: '26 Oct 2026, 09:05 am',
    isoDate: '2026-10-26T09:05:00.000Z',
    description: 'The eSSL biometric scanner outside H-201 has a scratched optical sensor and rejects 70% of student thumbprints during the 8:45 AM rush, causing long queues and late attendance marks.',
    remarks: 'Assigned to IT Hardware Support for optical prism sensor replacement.'
  },
  {
    id: 'RP-1034',
    regNo: '241FA07019',
    title: '3D Printer Extruder Nozzle Clogged in Robotics Prototyping Lab',
    category: 'Academics',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Robotics FabLab - Room 105',
    hostelBlock: 'Academic Complex',
    dateStr: '28 Sep 2026, 04:20 pm',
    isoDate: '2026-09-28T16:20:00.000Z',
    description: 'Both Creality Ender-3 Pro 3D printers in the FabLab have clogged 0.4mm brass nozzles and warped PEI build plates, halting chassis printing for our autonomous drone project.',
    remarks: 'FabLab technician installed hardened steel nozzles and leveled new magnetic build plates.'
  },
  {
    id: 'RP-1035',
    regNo: '241FA07020',
    title: 'Solar Water Heater Not Supplying Hot Water in Priyadarshini Hostel Block A',
    category: 'Hostel & Facilities',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Priyadarshini Girls Hostel - Block A, 4th Floor',
    hostelBlock: 'Priyadarshini Girls Hostel',
    dateStr: '25 Oct 2026, 06:50 am',
    isoDate: '2026-10-25T06:50:00.000Z',
    description: 'Even at 6:30 AM, the hot water tap line in Priyadarshini Block A 4th floor washrooms only gives cold water. The rooftop solar manifold mixing valve appears stuck.',
    remarks: 'Estate plumbing team descaling solar collector circulation pipes.'
  },
  {
    id: 'RP-1036',
    regNo: '241FA07021',
    title: 'Senior Students Forcing First-Year Hostellers to Write Lab Records Late at Night',
    category: 'Anti-Ragging & Harassment',
    priority: 'Urgent',
    status: 'In Progress',
    location: 'NTR Mens Hostel - Block B Common Room',
    hostelBlock: 'NTR Mens Hostel',
    dateStr: '27 Oct 2026, 10:30 pm',
    isoDate: '2026-10-27T22:30:00.000Z',
    description: 'A group of three seniors has been calling juniors to the 2nd floor common area after 10:30 PM and intimidating them into completing engineering drawing sheets and lab records.',
    remarks: 'Retained by SuperAdmin Executive Desk & Anti-Ragging Flying Squad; night warden patrol deployed immediately.'
  },
  {
    id: 'RP-1037',
    regNo: '241FA07022',
    title: 'Broken Split AC Louver and Water Dripping in AI Lab 2',
    category: 'Electrical',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Sangamam Block - AI Lab 2',
    hostelBlock: 'Academic Complex',
    dateStr: '19 Sep 2026, 02:15 pm',
    isoDate: '2026-09-19T14:15:00.000Z',
    description: 'The Voltas 2-ton split AC unit above row 3 in AI Lab 2 is dripping water onto keyboard trays because the condensate drain tube is blocked.',
    remarks: 'Electrical & HVAC crew flushed drain line and sanitized evaporator coils.'
  },
  {
    id: 'RP-1038',
    regNo: '241FA07023',
    title: 'Request for Harvard Business Review Case Study Access in BBA Seminar Library',
    category: 'Library',
    priority: 'Low',
    status: 'Pending',
    location: 'Management Block - Departmental Library',
    hostelBlock: 'Academic Complex',
    dateStr: '20 Oct 2026, 11:30 am',
    isoDate: '2026-10-20T11:30:00.000Z',
    description: 'Our Strategic Management course requires HBR case studies, but the departmental library login credentials for EBSCO Business Source Elite expired last week.',
    remarks: 'Forwarded to Management HOD and University Librarian for subscription renewal.'
  },
  {
    id: 'RP-1039',
    regNo: '241FA07024',
    title: 'Microcontroller 8051 Trainer Kits Have Faulty RS-232 Serial Adapters',
    category: 'Academics',
    priority: 'Medium',
    status: 'Resolved',
    location: 'ECE Block - Microprocessors Lab',
    hostelBlock: 'Academic Complex',
    dateStr: '06 Oct 2026, 03:00 pm',
    isoDate: '2026-10-06T15:00:00.000Z',
    description: 'The USB-to-RS232 CH340 converter cables in the Microprocessors Lab are failing on Windows 11 PCs, preventing us from flashing hex files to the 8051 trainer boards.',
    remarks: 'ECE Lab Technician installed signed FTDI USB-Serial cables on all 30 stations.'
  },
  {
    id: 'RP-1040',
    regNo: '241FA07025',
    title: 'Single-Yarn Tensile Strength Tester Load Cell Calibration Overdue',
    category: 'Academics',
    priority: 'High',
    status: 'Pending',
    location: 'Textile Testing Lab - U Block',
    hostelBlock: 'Academic Complex',
    dateStr: '23 Oct 2026, 10:20 am',
    isoDate: '2026-10-23T10:20:00.000Z',
    description: 'The Instron yarn tensile strength tester in the Textile Quality Lab is showing a +18% zero-offset error even when unloaded, affecting our fabric quality lab readings.',
    remarks: 'Assigned to Textile Department HOD for NABL calibration vendor visit.'
  },
  {
    id: 'RP-1041',
    regNo: '241FA07026',
    title: 'PostgreSQL & Apache Spark Cluster Out of Disk Space in Data Science Lab',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'Resolved',
    location: 'CS-DS Big Data Lab - Sangamam 3rd Floor',
    hostelBlock: 'Academic Complex',
    dateStr: '11 Oct 2026, 04:40 pm',
    isoDate: '2026-10-11T16:40:00.000Z',
    description: 'The `/var/lib/hadoop` partition on our lab Spark cluster is 100% full due to uncleaned temporary shuffle logs, causing all PySpark MapReduce jobs to fail.',
    remarks: 'IT Admin purged stale HDFS temp directories and expanded LVM volume by 500GB.'
  },
  {
    id: 'RP-1042',
    regNo: '241FA07027',
    title: 'Canteen UPI QR Scanner Machine Offline and Overcharging on Packaged Drinks',
    category: 'Mess & Dining',
    priority: 'Medium',
    status: 'Rejected',
    location: 'Main Campus Food Court - Counter 2',
    hostelBlock: 'General / Campus',
    dateStr: '22 Sep 2026, 01:25 pm',
    isoDate: '2026-09-22T13:25:00.000Z',
    description: 'The juice stall vendor insisted on Rs. 5 extra cooling charge on a Rs. 20 tetra pack, claiming the refrigerator electricity cost is high.',
    remarks: 'Rejected duplicate ticket: Merged with master canteen MRP inspection order #RP-1009; vendor fined Rs. 2,000.'
  },
  {
    id: 'RP-1043',
    regNo: '241FA07028',
    title: 'Firewall Blocking GitHub SSH Port 22 on Campus Student Wi-Fi',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'Resolved',
    location: 'Campus-Wide Student Wi-Fi (Vignan_Student_5G)',
    hostelBlock: 'General / Campus',
    dateStr: '30 Sep 2026, 06:10 pm',
    isoDate: '2026-09-30T18:10:00.000Z',
    description: 'Whenever we run `git push` or `git clone` over SSH (`git@github.com`) on Vignan_Student_5G Wi-Fi, the Sophos XG firewall drops port 22 connections with connection timed out.',
    remarks: 'Network Security Administrator whitelisted `github.com` and `gitlab.com` on TCP Port 22 & 443.'
  },
  {
    id: 'RP-1044',
    regNo: '241FA07029',
    title: 'Broken Ergonomic Chairs in MCA Programming Lab 1',
    category: 'Infrastructure & Maintenance',
    priority: 'Low',
    status: 'Pending',
    location: 'MCA Block - Computer Lab 1',
    hostelBlock: 'Academic Complex',
    dateStr: '21 Oct 2026, 03:35 pm',
    isoDate: '2026-10-21T15:35:00.000Z',
    description: 'At least 12 revolving computer chairs in MCA Lab 1 have broken hydraulic cylinders or missing armrests, making 3-hour coding lab sessions very uncomfortable.',
    remarks: 'Estate furniture team scheduled replacement from central warehouse stock.'
  },
  {
    id: 'RP-1045',
    regNo: '241FA07030',
    title: 'Overflowing Stormwater Drain Near H-Block Bicycle Parking Shed',
    category: 'Sanitation & Hygiene',
    priority: 'High',
    status: 'Resolved',
    location: 'H-Block Entrance Walkway',
    hostelBlock: 'Academic Complex',
    dateStr: '09 Oct 2026, 09:30 am',
    isoDate: '2026-10-09T09:30:00.000Z',
    description: 'Following yesterday evening rain, the covered drain beside H-Block cycle parking is clogged with plastic bottles and stagnant water is pooling across the pedestrian ramp.',
    remarks: 'Sanitation crew cleared drain blockage and sprayed anti-larval disinfectant.'
  },
  {
    id: 'RP-1046',
    regNo: '241FA07031',
    title: 'Bonafide & Study Certificate Application Pending at Admin Desk for 6 Days',
    category: 'Academics',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Student Services Cell - Admin Block Ground Floor',
    hostelBlock: 'Library & Admin Block',
    dateStr: '17 Sep 2026, 11:00 am',
    isoDate: '2026-09-17T11:00:00.000Z',
    description: 'I applied for a Bonafide Certificate on 11th September for my education loan renewal at SBI, and the status is still stuck at "Clerk Verification". Bank deadline is tomorrow.',
    remarks: 'Digital Bonafide Certificate signed by Registrar and issued via student portal.'
  },
  {
    id: 'RP-1047',
    regNo: '241FA07032',
    title: 'LiPo Battery Balance Chargers Missing Safety Fireproof Bags in Drone Lab',
    category: 'Infrastructure & Maintenance',
    priority: 'Urgent',
    status: 'In Progress',
    location: 'UAV & Drone Research Lab - Robotics Wing',
    hostelBlock: 'Academic Complex',
    dateStr: '26 Oct 2026, 04:50 pm',
    isoDate: '2026-10-26T16:50:00.000Z',
    description: 'Students are charging 6S 5000mAh LiPo batteries directly on wooden workbenches without fireproof LiPo safe bags or a Class-D fire extinguisher nearby.',
    remarks: 'Robotics HOD ordered 10 fiberglass LiPo charging pouches and mounted CO2/Dry Powder extinguishers.'
  },
  {
    id: 'RP-1048',
    regNo: '241FA07033',
    title: 'Distilled Water Plant Filter Cartridge Exhausted in Biochemistry Lab',
    category: 'Academics',
    priority: 'Medium',
    status: 'Resolved',
    location: 'BI & BT Block - Biochemistry Lab 3',
    hostelBlock: 'Academic Complex',
    dateStr: '25 Sep 2026, 10:15 am',
    isoDate: '2026-09-25T10:15:00.000Z',
    description: 'The Millipore deionized water unit in Biochemistry Lab 3 is showing conductivity above 15 microSiemens/cm, contaminating buffer preparation for enzyme kinetics experiments.',
    remarks: 'Lab stores replaced mixed-bed resin cartridge; conductivity restored to 0.8 uS/cm.'
  },
  {
    id: 'RP-1049',
    regNo: '241FA07034',
    title: 'Streetlights Not Working Along Walkway Between Central Library and NTR Hostel',
    category: 'Electrical',
    priority: 'High',
    status: 'In Progress',
    location: 'Library to NTR Hostel Main Avenue',
    hostelBlock: 'General / Campus',
    dateStr: '27 Oct 2026, 07:15 pm',
    isoDate: '2026-10-27T19:15:00.000Z',
    description: 'Four consecutive LED street poles between the Central Library exit gate and NTR Boys Hostel arch have been completely dark after 6:30 PM for two days.',
    remarks: 'Electrical maintenance team tracing underground feeder cable fault.'
  },
  {
    id: 'RP-1050',
    regNo: '241FA07035',
    title: 'Insects Found in Evening Tea Snacks at Hostel Mess Counter',
    category: 'Mess & Dining',
    priority: 'Urgent',
    status: 'Resolved',
    location: 'NTR Hostel Mess Hall - Counter 1',
    hostelBlock: 'NTR Mens Hostel',
    dateStr: '04 Oct 2026, 05:10 pm',
    isoDate: '2026-10-04T17:10:00.000Z',
    description: 'Today during evening snacks at 4:45 PM, the onion pakoda tray was left uncovered near the open window and flies were settling on the food. Strict hygiene covers are needed.',
    remarks: 'Estate Warden installed air curtains at mess entrances and mandated stainless steel mesh domes.'
  },
  {
    id: 'RP-1051',
    regNo: '241FA07036',
    title: 'SAP ERP Student License Key Expired in Business Systems Lab',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'Pending',
    location: 'CS-BS Lab - Sangamam 2nd Floor',
    hostelBlock: 'Academic Complex',
    dateStr: '26 Oct 2026, 11:45 am',
    isoDate: '2026-10-26T11:45:00.000Z',
    description: 'When logging into the SAP GUI client for Enterprise Resource Planning practicals, client 800 rejects login with "SAP University Alliances temporary license expired".',
    remarks: 'Assigned to IT & CS-BS Coordinator to apply renewed SAP hardware key.'
  },
  {
    id: 'RP-1052',
    regNo: '241FA07037',
    title: 'Girls Hostel Reading Room AC Turned Off Before 10:00 PM During Mid-Exams',
    category: 'Hostel & Facilities',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Priyadarshini Girls Hostel - Ground Floor Study Hall',
    hostelBlock: 'Priyadarshini Girls Hostel',
    dateStr: '01 Oct 2026, 10:20 pm',
    isoDate: '2026-10-01T22:20:00.000Z',
    description: 'The study hall in Priyadarshini Hostel gets very stuffy with 60+ students preparing for mid-exams, as the caretaker turns off the AC at 9:30 PM sharp.',
    remarks: 'Chief Warden extended study room AC timing until 1:00 AM throughout exam weeks.'
  },
  {
    id: 'RP-1053',
    regNo: '241FA07038',
    title: 'Bus #22 (Vijayawada Benz Circle) Delayed by 35 Minutes at Mangalagiri Toll',
    category: 'Transport',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Vijayawada Route Bus #22',
    hostelBlock: 'General / Campus',
    dateStr: '24 Oct 2026, 09:20 am',
    isoDate: '2026-10-24T09:20:00.000Z',
    description: 'Bus #22 from Benz Circle had a FASTag balance blacklist issue at Kaza Toll Plaza today, delaying 55 students by 35 minutes and causing us to miss first hour attendance.',
    remarks: 'Transport Coordinator recharged fleet FASTag wallet and notified HoDs to excuse 1st period attendance.'
  },
  {
    id: 'RP-1054',
    regNo: '241FA07039',
    title: 'Hall Ticket Download Blocked Due to Incorrect Library Book Due Entry',
    category: 'Examinations',
    priority: 'Urgent',
    status: 'Resolved',
    location: 'Examination ERP Portal / Central Library',
    hostelBlock: 'Library & Admin Block',
    dateStr: '15 Oct 2026, 03:40 pm',
    isoDate: '2026-10-15T15:40:00.000Z',
    description: 'I returned "Computer Networking: A Top-Down Approach" (Acc No. 48219) on 3rd October, but the Koha ILS status still shows "Issued", blocking my semester hall ticket download.',
    remarks: 'Librarian verified shelf inventory, cleared Koha hold, and enabled hall ticket download.'
  },
  {
    id: 'RP-1055',
    regNo: '241FA07040',
    title: 'Broken Bathroom Door Latch and Leaking Flush Tank in NTR Hostel Block A',
    category: 'Hostel & Facilities',
    priority: 'Medium',
    status: 'Pending',
    location: 'NTR Mens Hostel - Block A, 1st Floor Washroom',
    hostelBlock: 'Hostel Block A',
    dateStr: '25 Oct 2026, 08:10 am',
    isoDate: '2026-10-25T08:10:00.000Z',
    description: 'Cubicle #3 in Block A 1st floor washroom has a broken aluminum tower bolt and the flush cistern leaks continuously onto the floor.',
    remarks: 'Assigned to Hostel Plumber & Carpenter for immediate repair.'
  },

  // ── 231FA07xxx SENIOR BATCH COMPLAINTS ──
  {
    id: 'RP-1056',
    regNo: '231FA07004',
    title: 'Placement Portal Resume Upload Failing for PDFs Larger Than 1MB',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'Resolved',
    location: 'Training & Placement Cell Portal',
    hostelBlock: 'Online / No location',
    dateStr: '20 Sep 2026, 04:05 pm',
    isoDate: '2026-09-20T16:05:00.000Z',
    description: '3rd-year students registering for the upcoming internship drive cannot upload resumes above 1MB on the T&P portal due to an Nginx `client_max_body_size` 413 error.',
    remarks: 'IT Web Admin increased Nginx upload limit to 10MB on the placement server.'
  },
  {
    id: 'RP-1057',
    regNo: '231FA07015',
    title: 'Request for GPU Cluster Quota Extension for IEEE Paper Experiments',
    category: 'Academics',
    priority: 'Medium',
    status: 'In Progress',
    location: 'AI & ML Research Lab - H Block',
    hostelBlock: 'Academic Complex',
    dateStr: '22 Oct 2026, 05:00 pm',
    isoDate: '2026-10-22T17:00:00.000Z',
    description: 'Our Slurm job queue limit on the DGX-A100 station caps jobs at 4 hours, which terminates our LLM fine-tuning checkpoints mid-epoch. Requesting 12-hour research quota.',
    remarks: 'AI & ML HOD reviewing Slurm partition priority for 3rd-year research batches.'
  },
  {
    id: 'RP-1058',
    regNo: '231FA07027',
    title: 'Spectrum Analyzer RF Input Attenuator Damaged in Microwave Engineering Lab',
    category: 'Academics',
    priority: 'High',
    status: 'Pending',
    location: 'ECE Block - Microwave & Antenna Lab',
    hostelBlock: 'Academic Complex',
    dateStr: '26 Oct 2026, 02:15 pm',
    isoDate: '2026-10-26T14:15:00.000Z',
    description: 'The Rohde & Schwarz 3GHz Spectrum Analyzer in the Antenna Lab displays an "RF Overload / ADC Clip" warning even with a -20dB pad connected.',
    remarks: 'Assigned to ECE HOD for manufacturer service calibration.'
  },
  {
    id: 'RP-1059',
    regNo: '231FA07038',
    title: 'Refund of Double-Debited Semester Exam Registration Fee (Rs. 1,800)',
    category: 'Finance & Scholarship',
    priority: 'High',
    status: 'Resolved',
    location: 'Online Fee Payment Gateway / Finance Office',
    hostelBlock: 'Library & Admin Block',
    dateStr: '12 Sep 2026, 12:40 pm',
    isoDate: '2026-09-12T12:40:00.000Z',
    description: 'While paying my 5th-semester exam fee via BillDesk UPI, the amount of Rs. 1,800 was deducted twice (Txn IDs: BD99281104 and BD99281189). Requesting refund of the duplicate debit.',
    remarks: 'Finance Officer verified settlement report and refunded Rs. 1,800 to source bank account.'
  },

  // ── 251FA07xxx FRESHER BATCH COMPLAINTS ──
  {
    id: 'RP-1060',
    regNo: '251FA07002',
    title: 'First-Year Engineering Physics Lab Vernier Calipers Have Illegible Scales',
    category: 'Academics',
    priority: 'Low',
    status: 'Resolved',
    location: 'First Year Block - Physics Lab 2',
    hostelBlock: 'Academic Complex',
    dateStr: '03 Oct 2026, 10:50 am',
    isoDate: '2026-10-03T10:50:00.000Z',
    description: 'Several vernier calipers and screw gauges in First Year Physics Lab 2 have rusted main scales where millimeter markings are completely worn off.',
    remarks: 'Physics Department replaced 20 old calipers with new Mitutoyo stainless steel instruments.'
  },
  {
    id: 'RP-1061',
    regNo: '251FA07014',
    title: 'Hostel Mess Breakfast Idli Batter Too Sour and Chutney Watery',
    category: 'Mess & Dining',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Priyadarshini Hostel Mess',
    hostelBlock: 'Priyadarshini Girls Hostel',
    dateStr: '25 Oct 2026, 08:25 am',
    isoDate: '2026-10-25T08:25:00.000Z',
    description: 'For the last four days, the morning idli served at Priyadarshini Girls Mess tastes overly fermented and sour, and the peanut chutney is diluted like water.',
    remarks: 'Mess Food Inspector issued warning notice to catering contractor and sampled batter quality.'
  },
  {
    id: 'RP-1062',
    regNo: '251FA07026',
    title: 'Request for Locker Facility in Central Workshop for 1st Year Students',
    category: 'Infrastructure & Maintenance',
    priority: 'Low',
    status: 'Rejected',
    location: 'Mechanical & Engineering Workshop Shed',
    hostelBlock: 'Academic Complex',
    dateStr: '14 Sep 2026, 03:30 pm',
    isoDate: '2026-09-14T15:30:00.000Z',
    description: 'Requesting individual permanent steel lockers for all 600 first-year students inside the Engineering Workshop shed to keep our aprons and mini-drafters.',
    remarks: 'Rejected: Pigeonhole bag racks are already provided at the workshop entrance; individual permanent lockers for 600 day-scholars exceed floor space capacity.'
  },
  {
    id: 'RP-1063',
    regNo: '251FA07035',
    title: 'Student ID Card RFID Chip Not Opening Central Library Turnstile Gate',
    category: 'Library',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Central Library Main Entrance Turnstile',
    hostelBlock: 'Library & Admin Block',
    dateStr: '07 Oct 2026, 11:15 am',
    isoDate: '2026-10-07T11:15:00.000Z',
    description: 'My newly issued 1st-year RFID smart card (251FA07035) beeps red at the Central Library entrance flap barrier even though my library account is active.',
    remarks: 'Library IT desk mapped Mifare UID to Koha patron record; card now opens turnstile smoothly.'
  },

  // ── ADDITIONAL COMPLAINTS BY STUDENTS (2–3 COMPLAINTS PER STUDENT) TO EXCEED 68 TOTAL ──
  {
    id: 'RP-1064',
    regNo: '241FA07001',
    title: 'Linux Kernel Panic on Dual-Boot Systems in CSE Programming Lab 1',
    category: 'IT & Wi-Fi',
    priority: 'Medium',
    status: 'Pending',
    location: 'H-Block - CSE Lab 1',
    hostelBlock: 'Academic Complex',
    dateStr: '27 Oct 2026, 02:10 pm',
    isoDate: '2026-10-27T14:10:00.000Z',
    description: 'After the Windows 11 cumulative update yesterday, GRUB bootloader on 14 PCs in CSE Lab 1 fails to boot Ubuntu 24.04 LTS for our System Programming lab.',
    remarks: 'Assigned to CSE Lab Systems Administrator to repair GRUB EFI partitions.'
  },
  {
    id: 'RP-1065',
    regNo: '241FA07002',
    title: 'Ceiling Plaster Peeling Off Near Staircase in Priyadarshini Hostel Block B',
    category: 'Infrastructure & Maintenance',
    priority: 'High',
    status: 'In Progress',
    location: 'Priyadarshini Girls Hostel - Block B 2nd Floor Stairwell',
    hostelBlock: 'Priyadarshini Girls Hostel',
    dateStr: '23 Oct 2026, 05:40 pm',
    isoDate: '2026-10-23T17:40:00.000Z',
    description: 'Dampness from the terrace rainwater pipe has caused a 3-foot patch of ceiling plaster above the 2nd floor staircase landing to crack and flake off.',
    remarks: 'Civil Engineering maintenance team cordoned off landing and started waterproofing patch work.'
  },
  {
    id: 'RP-1066',
    regNo: '241FA07003',
    title: 'Bus #11 (Chilakaluripet Route) Driver Skipping Stop Near Bus Stand',
    category: 'Transport',
    priority: 'High',
    status: 'Resolved',
    location: 'Chilakaluripet Route Bus #11',
    hostelBlock: 'General / Campus',
    dateStr: '26 Sep 2026, 08:15 am',
    isoDate: '2026-09-26T08:15:00.000Z',
    description: 'On two occasions this week, the relief driver on Bus #11 took the highway bypass instead of stopping at the designated Chilakaluripet Clock Tower pickup point at 7:10 AM.',
    remarks: 'Transport Officer reprimanded relief driver and enabled GPS geofence compliance alerts.'
  },
  {
    id: 'RP-1067',
    regNo: '241FA07004',
    title: 'Request to Extend Central Library Reading Hours Until Midnight Before Semester Exams',
    category: 'Library',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Central Library Reading Hall',
    hostelBlock: 'Library & Admin Block',
    dateStr: '16 Oct 2026, 06:00 pm',
    isoDate: '2026-10-16T18:00:00.000Z',
    description: 'Currently the Central Library reference hall closes at 8:30 PM. With end-semester exams approaching next month, hostellers need quiet reading space until 11:30 PM.',
    remarks: 'Vice-Chancellor & Chief Librarian approved extended library hours (8:00 AM to 11:30 PM) with security escort for girls hostel.'
  },
  {
    id: 'RP-1068',
    regNo: '241FA07005',
    title: 'Power Socket Strips Sparking Under Workbench 4 in Cyber Security Lab',
    category: 'Electrical',
    priority: 'Urgent',
    status: 'Resolved',
    location: 'Sangamam Block - Cyber Security Lab',
    hostelBlock: 'Academic Complex',
    dateStr: '08 Oct 2026, 01:45 pm',
    isoDate: '2026-10-08T13:45:00.000Z',
    description: 'The 16A gang box beneath Workbench 4 in the Cyber Security Lab is loose and sparks whenever monitor power cords are plugged in.',
    remarks: 'Electrical safety team replaced entire gang box and crimped ferrule lugs on UPS line.'
  },
  {
    id: 'RP-1069',
    regNo: '241FA07008',
    title: 'Outsiders Using Campus Cricket Practice Nets Without Permission in Evening',
    category: 'Infrastructure & Maintenance',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Mahotsav Sports Ground - Cricket Nets',
    hostelBlock: 'General / Campus',
    dateStr: '11 Sep 2026, 05:50 pm',
    isoDate: '2026-09-11T17:50:00.000Z',
    description: 'Unauthorized non-students are entering through the rear service gate at 4:30 PM and occupying both turf cricket practice nets meant for university team practice.',
    remarks: 'Chief Security Officer stationed a guard at the sports gate to verify university ID cards.'
  },
  {
    id: 'RP-1070',
    regNo: '241FA07010',
    title: ' Stray Dogs Entering NTR Hostel Dining Corridor at Night',
    category: 'Sanitation & Hygiene',
    priority: 'High',
    status: 'In Progress',
    location: 'NTR Mens Hostel - Ground Floor Mess Corridor',
    hostelBlock: 'NTR Mens Hostel',
    dateStr: '27 Oct 2026, 08:55 pm',
    isoDate: '2026-10-27T20:55:00.000Z',
    description: 'Because the rear collapsible gate of the NTR Hostel handwash area is left unlatched after dinner, 3-4 stray dogs enter the corridor and overturn waste bins.',
    remarks: 'Estate Warden instructed night guards to lock rear grill gate at 9:30 PM and installed spring door closers.'
  },
  {
    id: 'RP-1071',
    regNo: '241FA07012',
    title: 'DBMS Lab Oracle 19c Listener Service Down on Server 10.10.4.12',
    category: 'IT & Wi-Fi',
    priority: 'High',
    status: 'Resolved',
    location: 'H-Block - CSE Database Lab',
    hostelBlock: 'Academic Complex',
    dateStr: '13 Oct 2026, 10:30 am',
    isoDate: '2026-10-13T10:30:00.000Z',
    description: 'SQL*Plus clients in the CSE Database Lab are throwing `ORA-12541: TNS:no listener` when connecting to the central Oracle 19c lab server `10.10.4.12`.',
    remarks: 'DBA restarted `tnslsnr` service and configured systemd auto-restart on server.'
  },
  {
    id: 'RP-1072',
    regNo: '241FA07014',
    title: 'Request for Extra Evening Bus to Guntur After Mahotsav Cultural Rehearsals',
    category: 'Transport',
    priority: 'Low',
    status: 'Pending',
    location: 'Open Air Auditorium / Transport Bay',
    hostelBlock: 'General / Campus',
    dateStr: '26 Oct 2026, 06:20 pm',
    isoDate: '2026-10-26T18:20:00.000Z',
    description: 'Over 45 day-scholars participating in Vignan Mahotsav dance and music rehearsals finish practice at 6:15 PM. Requesting one late bus to Guntur & Tenali at 6:30 PM this week.',
    remarks: 'Under review by Transport Officer & Student Welfare Dean.'
  },
  {
    id: 'RP-1073',
    regNo: '241FA07018',
    title: 'Harassing Anonymous Messages Sent in Unofficial Class WhatsApp Group',
    category: 'Anti-Ragging & Harassment',
    priority: 'Urgent',
    status: 'In Progress',
    location: 'Online / CSE 2nd Year Section B',
    hostelBlock: 'Online / No location',
    dateStr: '27 Oct 2026, 04:10 pm',
    isoDate: '2026-10-27T16:10:00.000Z',
    description: 'An unknown number joined our Section B study group via an invite link and posted derogatory morphed comments targeting female students. Screenshots attached for disciplinary action.',
    remarks: 'Retained by SuperAdmin & Internal Complaints Committee (ICC); Cyber cell tracing phone number.'
  },
  {
    id: 'RP-1074',
    regNo: '241FA07020',
    title: 'Water Cooler Drainage Pipe Leaking Across Sangamam 1st Floor Corridor',
    category: 'Sanitation & Hygiene',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Sangamam Block - 1st Floor Near Room S-108',
    hostelBlock: 'Academic Complex',
    dateStr: '19 Aug 2026, 11:25 am',
    isoDate: '2026-08-19T11:25:00.000Z',
    description: 'The PVC waste pipe behind the drinking water station near S-108 has detached, making the vitrified floor tiles dangerously slippery for students walking between classes.',
    remarks: 'Plumbing team solvent-welded new UPVC elbow joint and dried the corridor.'
  },
  {
    id: 'RP-1075',
    regNo: '241FA07022',
    title: 'Delay in Issuing Gate Pass for Attending Smart India Hackathon Finale',
    category: 'Academics',
    priority: 'High',
    status: 'Resolved',
    location: 'AI & ML HoD Office / Hostel Gate',
    hostelBlock: 'Academic Complex',
    dateStr: '28 Aug 2026, 04:00 pm',
    isoDate: '2026-08-28T16:00:00.000Z',
    description: 'Our 6-member team needs an out-station hostel gate pass at 5:00 AM tomorrow to catch the train for the Smart India Hackathon nodal center, but the ERP out-pass workflow is stuck.',
    remarks: 'AI & ML HOD & Chief Warden approved emergency digital gate pass on ERP.'
  },
  {
    id: 'RP-1076',
    regNo: '241FA07026',
    title: 'Ceiling Fan Making Loud Grinding Noise in Classroom S-304',
    category: 'Electrical',
    priority: 'Low',
    status: 'Pending',
    location: 'Sangamam Block - Classroom S-304',
    hostelBlock: 'Academic Complex',
    dateStr: '25 Oct 2026, 12:00 pm',
    isoDate: '2026-10-25T12:00:00.000Z',
    description: 'The middle row ceiling fan in Classroom S-304 has a worn ball bearing and makes a loud metallic screeching sound, making it hard to hear the professor.',
    remarks: 'Assigned to Electrical Maintenance for bearing greasing and safety cotter-pin check.'
  },
  {
    id: 'RP-1077',
    regNo: '241FA07030',
    title: 'Duplicate Deduction of Hostel Mess Caution Deposit in 2nd Year Fee Receipt',
    category: 'Finance & Scholarship',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Hostel Accounts Desk - Admin Block',
    hostelBlock: 'Library & Admin Block',
    dateStr: '23 Oct 2026, 11:10 am',
    isoDate: '2026-10-23T11:10:00.000Z',
    description: 'The one-time refundable Mess Caution Deposit of Rs. 5,000 was already paid during my 1st-year admission, but it has been billed again in my 2nd-year hostel fee challan.',
    remarks: 'Accounts Officer verifying 2024-25 admission ledger to adjust Rs. 5,000 against Sem-4 mess dues.'
  },
  {
    id: 'RP-1078',
    regNo: '231FA07004',
    title: 'Request to Install Additional Power Sockets at Central Library Laptop Desk',
    category: 'Infrastructure & Maintenance',
    priority: 'Low',
    status: 'Resolved',
    location: 'Central Library - 2nd Floor Digital Zone',
    hostelBlock: 'Library & Admin Block',
    dateStr: '24 Aug 2026, 03:20 pm',
    isoDate: '2026-08-24T15:20:00.000Z',
    description: 'In the 2nd floor bring-your-own-laptop reading zone of Central Library, half of the desk power sockets are loose and only 10 charging points work for 40 seats.',
    remarks: 'Electrical department installed Legrand modular power tracks across all 4 reading tables.'
  }
];

async function generateSeedDatabase() {
  console.log('🌱 Generating comprehensive ResolveHub JSON database...');

  // Pre-compute bcrypt hashes cleanly
  const superAdminHash1 = await bcrypt.hash('SAI@@@killer197712200611', 10);
  const superAdminHash2 = await bcrypt.hash('admin123', 10);
  const deptLegacyHash = await bcrypt.hash('dept123', 10);

  const staff = [
    {
      _id: 'staff-sa-001',
      id: 'SA-001',
      username: 'ksaiganesh64',
      passwordHash: superAdminHash1,
      name: 'K Sai Ganesh (Super Admin)',
      role: 'super_admin',
      department: 'All Departments',
      email: 'ksaiganesh64@vignan.ac.in',
      phone: '+91 9876543210',
      status: 'ACTIVE',
      createdAt: '2026-08-01T09:00:00.000Z'
    },
    {
      _id: 'staff-sa-002',
      id: 'admin-super-002',
      username: 'superadmin',
      passwordHash: superAdminHash2,
      name: 'Vignan Executive Super Admin',
      role: 'super_admin',
      department: 'All Departments',
      email: 'superadmin@vignan.ac.in',
      phone: '+91 9876543211',
      status: 'ACTIVE',
      createdAt: '2026-08-01T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-cse',
      id: 'hod-cse-01',
      username: 'cse_hod_admin',
      passwordHash: await bcrypt.hash('VignanCSE@2026', 10),
      name: 'Dr. K.Venkata Rao (CSE HOD)',
      role: 'dept_admin',
      department: 'CSE (Computer Science & Engineering)',
      email: 'hod.cse@vignan.ac.in',
      phone: '+91 9848022001',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-it',
      id: 'hod-it-02',
      username: 'it_network_admin',
      passwordHash: await bcrypt.hash('VignanIT@2026', 10),
      name: 'Dr. N. Srinivasu (IT & Network HOD)',
      role: 'dept_admin',
      department: 'Information Technology (IT)',
      email: 'hod.it@vignan.ac.in',
      phone: '+91 9848022002',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-aiml',
      id: 'hod-aiml-03',
      username: 'aiml_hod_admin',
      passwordHash: await bcrypt.hash('VignanAIML@2026', 10),
      name: 'Dr. S. Pravallika (AI & ML HOD)',
      role: 'dept_admin',
      department: 'AI & ML (Artificial Intelligence & Machine Learning)',
      email: 'hod.aiml@vignan.ac.in',
      phone: '+91 9848022003',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-cyber',
      id: 'hod-cyber-04',
      username: 'cyber_hod_admin',
      passwordHash: await bcrypt.hash('VignanCyber@2026', 10),
      name: 'Dr. M. Rajasekhar (Cyber Security HOD)',
      role: 'dept_admin',
      department: 'Cyber Security',
      email: 'hod.cyber@vignan.ac.in',
      phone: '+91 9848022004',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-ece',
      id: 'hod-ece-05',
      username: 'ece_hod_admin',
      passwordHash: await bcrypt.hash('VignanECE@2026', 10),
      name: 'Dr. T. Pitchaiah (ECE HOD)',
      role: 'dept_admin',
      department: 'ECE (Electronics & Communication Engineering)',
      email: 'hod.ece@vignan.ac.in',
      phone: '+91 9848022005',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-robotics',
      id: 'hod-robotics-06',
      username: 'robotics_hod_admin',
      passwordHash: await bcrypt.hash('VignanRobotics@2026', 10),
      name: 'Dr. B. Nageswara Rao (Robotics HOD)',
      role: 'dept_admin',
      department: 'Robotics',
      email: 'hod.robotics@vignan.ac.in',
      phone: '+91 9848022006',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-mgmt',
      id: 'hod-mgmt-07',
      username: 'mgmt_hod_admin',
      passwordHash: await bcrypt.hash('VignanMgmt@2026', 10),
      name: 'Dr. K. Kalpana (Management BBA/MBA/MCA HOD)',
      role: 'dept_admin',
      department: 'Management (BBA / MBA / MCA)',
      email: 'hod.mgmt@vignan.ac.in',
      phone: '+91 9848022007',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-hod-estate',
      id: 'hod-estate-08',
      username: 'estate_warden_admin',
      passwordHash: await bcrypt.hash('VignanEstate@2026', 10),
      name: 'Col. R. Hanumantha Rao (Estate & Hostel Warden)',
      role: 'dept_admin',
      department: 'Estate & Hostel Management',
      email: 'warden.estate@vignan.ac.in',
      phone: '+91 9848022008',
      status: 'ACTIVE',
      createdAt: '2026-08-02T09:00:00.000Z'
    },
    {
      _id: 'staff-legacy-it',
      id: 'admin-dept-it',
      username: 'dept_it',
      passwordHash: deptLegacyHash,
      name: 'Vikram Mehta (IT Specialist)',
      role: 'dept_admin',
      department: 'Information Technology (IT)',
      email: 'dept.it@vignan.ac.in',
      phone: '+91 9848022009',
      status: 'ACTIVE',
      createdAt: '2026-08-03T09:00:00.000Z'
    },
    {
      _id: 'staff-legacy-cse',
      id: 'admin-dept-cse',
      username: 'dept_cse',
      passwordHash: deptLegacyHash,
      name: 'Dr. Ramesh Babu (CSE Coordinator)',
      role: 'dept_admin',
      department: 'CSE (Computer Science & Engineering)',
      email: 'dept.cse@vignan.ac.in',
      phone: '+91 9848022010',
      status: 'ACTIVE',
      createdAt: '2026-08-03T09:00:00.000Z'
    }
  ];

  // Build 48 Student Accounts (`users`) & `signupRequests`
  const users = [];
  const signupRequests = [];
  const studentMap = new Map();

  for (let i = 0; i < STUDENTS_DATA.length; i++) {
    const st = STUDENTS_DATA[i];
    const pwdHash = await bcrypt.hash(st.regNo, 8);
    const email = `${st.regNo.toLowerCase()}@vignan.ac.in`;
    const userDoc = {
      _id: `usr-${st.regNo.toLowerCase()}`,
      id: `usr-${st.regNo}`,
      regNo: st.regNo,
      username: st.regNo,
      password: st.regNo, // Kept in JSON for easy reference alongside bcrypt hash
      passwordHash: pwdHash,
      name: st.fullName,
      fullName: st.fullName,
      email,
      phone: `+91 ${st.phone}`,
      department: st.dept,
      year: st.year,
      role: 'student',
      status: 'ACTIVE',
      mustChangePassword: false,
      failedAttempts: 0,
      lockoutUntil: null,
      activatedAt: '10 Aug 2026, 10:00 am',
      createdAt: '2026-08-10T10:00:00.000Z'
    };
    users.push(userDoc);
    studentMap.set(st.regNo, userDoc);

    signupRequests.push({
      _id: `req-${st.regNo.toLowerCase()}`,
      id: `req-${st.regNo}`,
      regNo: st.regNo,
      fullName: st.fullName,
      email,
      phone: `+91 ${st.phone}`,
      department: st.dept,
      year: st.year,
      passwordHash: pwdHash,
      status: 'APPROVED',
      rejectionReason: null,
      createdAt: '10 Aug 2026, 09:30 am'
    });
  }

  // Add 2 realistic PENDING signup requests for SuperAdmin Verification Queue
  const pendingStudents = [
    { regNo: '251FA07088', fullName: 'Niharika Konidela', dept: 'CSE (Computer Science & Engineering)', year: '1st Year', phone: '+91 9848099088' },
    { regNo: '251FA07092', fullName: 'Sai Dharam Tej V', dept: 'AI & ML (Artificial Intelligence & Machine Learning)', year: '1st Year', phone: '+91 9848099092' }
  ];
  for (const pst of pendingStudents) {
    signupRequests.unshift({
      _id: `req-${pst.regNo.toLowerCase()}`,
      id: `req-${pst.regNo}`,
      regNo: pst.regNo,
      fullName: pst.fullName,
      email: `${pst.regNo.toLowerCase()}@vignan.ac.in`,
      phone: pst.phone,
      department: pst.dept,
      year: pst.year,
      passwordHash: await bcrypt.hash(pst.regNo, 8),
      status: 'PENDING',
      rejectionReason: null,
      createdAt: '28 Oct 2026, 08:15 am'
    });
  }

  // Build 68 Realistic Complaints (`tickets`)
  const tickets = RAW_COMPLAINTS.map((rc) => {
    const st = studentMap.get(rc.regNo) || users[0];
    const smartRouting = smartRouteGrievance({
      title: rc.title,
      description: rc.description,
      category: rc.category,
      location: rc.location,
      studentDept: st.department,
      urgency: rc.priority
    });

    const assignedDept = smartRouting.isRetainedBySuperAdmin
      ? 'SuperAdmin Executive Desk'
      : (smartRouting.targetDepartment || st.department);

    const urgencyMap = { Low: 'low', Medium: 'medium', High: 'high', Urgent: 'critical' };
    const urgencyVal = urgencyMap[rc.priority] || 'medium';

    const isResolved = rc.status === 'Resolved';
    const isInProgress = rc.status === 'In Progress';
    const isRejected = rc.status === 'Rejected';

    return {
      _id: `tkt-${rc.id.toLowerCase()}`,
      id: rc.id,
      title: rc.title,
      category: rc.category,
      department: assignedDept,
      priority: rc.priority,
      urgency: urgencyVal,
      status: rc.status,
      slaStatus: rc.priority === 'Urgent' ? 'warning' : 'normal',
      isAnonymous: false,
      location: rc.location,
      hostelBlock: rc.hostelBlock,
      description: rc.description,
      responseRemarks: rc.remarks,
      isRetainedBySuperAdmin: smartRouting.isRetainedBySuperAdmin,
      routingScope: smartRouting.routingScope,
      routingReason: smartRouting.routingReason,
      escalationLevel: smartRouting.escalationLevel,
      assignedAgent: smartRouting.assignedHOD,
      assignedOfficer: smartRouting.assignedHOD?.name || 'Department Nodal Officer',
      complainant: {
        regNo: st.regNo,
        name: st.fullName,
        email: st.email,
        phone: st.phone,
        role: 'Student',
        department: st.department
      },
      submittedBy: `${st.fullName} (${st.regNo})`,
      submittedAt: rc.dateStr,
      createdAt: rc.dateStr,
      createdAtIso: rc.isoDate,
      updatedAt: rc.dateStr,
      eta: `${smartRouting.slaHours || 24} Hours (SLA Target)`,
      rating: isResolved ? 5 : null,
      ratingFeedback: isResolved ? 'Promptly resolved by the department team. Thank you!' : '',
      attachments: [],
      timeline: [
        {
          stepKey: 'submitted',
          title: 'Grievance Submitted',
          status: 'Submitted',
          timestamp: rc.dateStr,
          date: rc.dateStr,
          note: `Logged by ${st.fullName} (Reg No: ${st.regNo})`,
          completed: true
        },
        {
          stepKey: 'assigned',
          title: 'Smart Triage & HOD Routing',
          status: 'Assigned',
          timestamp: rc.dateStr,
          date: rc.dateStr,
          note: smartRouting.routingReason,
          completed: isInProgress || isResolved || isRejected
        },
        {
          stepKey: 'in_progress',
          title: 'Field Action & Inspection',
          status: 'In Progress',
          timestamp: isInProgress || isResolved ? rc.dateStr : '',
          date: isInProgress || isResolved ? rc.dateStr : 'Scheduled',
          note: rc.remarks,
          completed: isInProgress || isResolved
        },
        {
          stepKey: 'resolved',
          title: isRejected ? 'Closed / Rejected' : 'Resolution Verified',
          status: isRejected ? 'Rejected' : 'Resolved',
          timestamp: isResolved || isRejected ? rc.dateStr : '',
          date: isResolved || isRejected ? rc.dateStr : 'Pending Completion',
          note: isResolved || isRejected ? rc.remarks : 'Awaiting final closure',
          completed: isResolved || isRejected
        }
      ],
      auditLogs: [
        {
          id: `aud-${rc.id}-2`,
          timestamp: rc.dateStr,
          author: smartRouting.assignedHOD?.name || 'SuperAdmin Smart Triage Engine',
          role: smartRouting.assignedHOD?.role || 'Automated Triage Bot',
          action: `Status -> ${rc.status}`,
          note: rc.remarks
        },
        {
          id: `aud-${rc.id}-1`,
          timestamp: rc.dateStr,
          author: `${st.fullName} (${st.regNo})`,
          role: 'Student',
          action: 'Complaint Logged',
          note: `Submitted under ${rc.category} with ${rc.priority} priority.`
        }
      ]
    };
  });

  // Sort tickets newest first by ISO date
  tickets.sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime());

  const settings = {
    _id: 'settings-global',
    key: 'global_settings',
    categories: [
      'Hostel & Facilities',
      'Mess & Dining',
      'Academics',
      'Transport',
      'Library',
      'Infrastructure & Maintenance',
      'Finance & Scholarship',
      'Anti-Ragging & Harassment',
      'IT & Wi-Fi',
      'Examinations',
      'Electrical',
      'Sanitation & Hygiene'
    ],
    departments: [
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
      'Estate & Hostel Management',
      'SuperAdmin Executive Desk'
    ],
    priorities: ['Low', 'Medium', 'High', 'Urgent'],
    slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
  };

  const activityLogs = [
    {
      _id: 'log-1',
      id: 'log-1',
      timestamp: '28 Oct 2026, 09:00 am',
      author: 'K Sai Ganesh (Super Admin)',
      role: 'Super Admin',
      action: 'Smart Triage Auto-Routing',
      details: `Synchronized ${tickets.length} student grievances across ${users.length} registered Vignan students.`,
      createdAt: '2026-10-28T09:00:00.000Z'
    },
    {
      _id: 'log-2',
      id: 'log-2',
      timestamp: '27 Oct 2026, 10:15 am',
      author: 'Katabattula Venkata SivaSai Ganesh (241FA07011)',
      role: 'Student',
      action: 'Complaint Submitted',
      details: 'Logged High-priority grievance RP-1011 under IT & Wi-Fi.',
      createdAt: '2026-10-27T10:15:00.000Z'
    },
    {
      _id: 'log-3',
      id: 'log-3',
      timestamp: '27 Oct 2026, 11:05 am',
      author: 'Dr. S. Pravallika (AI & ML HOD)',
      role: 'Department Admin',
      action: 'Status Updated',
      details: 'Marked RP-1019 (GPU Server Node 02 CUDA Mismatch) as In Progress.',
      createdAt: '2026-10-27T11:05:00.000Z'
    }
  ];

  const dbPayload = {
    staff,
    users,
    signupRequests,
    tickets,
    settings,
    activityLogs
  };

  fs.mkdirSync(path.dirname(SERVER_JSON_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(ROOT_JSON_PATH), { recursive: true });

  const jsonString = JSON.stringify(dbPayload, null, 2);
  fs.writeFileSync(SERVER_JSON_PATH, jsonString, 'utf8');
  fs.writeFileSync(ROOT_JSON_PATH, jsonString, 'utf8');

  console.log(`✅ Seeded JSON Database successfully!`);
  console.log(`   - File 1: ${SERVER_JSON_PATH}`);
  console.log(`   - File 2: ${ROOT_JSON_PATH}`);
  console.log(`   - Students Seeded: ${users.length} unique registration numbers (including 241FA07011)`);
  console.log(`   - Admins/HODs Seeded: ${staff.length}`);
  console.log(`   - Complaints Seeded: ${tickets.length} unique grievances`);
}

if (require.main === module) {
  generateSeedDatabase().catch(err => {
    console.error('❌ Failed to generate seed database:', err);
    process.exit(1);
  });
}

module.exports = { generateSeedDatabase, STUDENTS_DATA, RAW_COMPLAINTS };

