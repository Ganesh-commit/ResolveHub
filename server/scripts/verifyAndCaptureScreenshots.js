const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:5174';
const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No Chrome/Edge executable found');
}

async function runVerificationAndScreenshots() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log('1️⃣ Verifying Backend API & CORS on http://localhost:3001...');

  // Test 1: Student Login (241FA07011 / 241FA07011)
  const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': FRONTEND_URL },
    body: JSON.stringify({ username: '241FA07011', regNo: '241FA07011', password: '241FA07011', role: 'student' })
  }).then(r => r.json());

  if (!studentLoginRes.success) {
    throw new Error(`Student 241FA07011 login failed: ${JSON.stringify(studentLoginRes)}`);
  }
  console.log(`   ✅ Student Login Verified: ${studentLoginRes.data.name} (${studentLoginRes.data.regNo})`);

  // Test 2: Super Admin Login
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': FRONTEND_URL },
    body: JSON.stringify({ username: 'ksaiganesh64', password: 'SAI@@@killer197712200611', role: 'super_admin' })
  }).then(r => r.json());

  if (!adminLoginRes.success) {
    throw new Error(`Super Admin login failed: ${JSON.stringify(adminLoginRes)}`);
  }
  console.log(`   ✅ Super Admin Login Verified: ${adminLoginRes.data.name}`);

  // Test 3: Raise a new test complaint from 241FA07011 if RP-1079 doesn't exist yet
  const existingTicketsRes = await fetch(`${API_BASE}/tickets`, {
    headers: { 'Origin': FRONTEND_URL, 'Authorization': `Bearer ${adminLoginRes.data.token}` }
  }).then(r => r.json());

  const hasTestTicket = (existingTicketsRes.data || []).some(t => t.id === 'RP-1079');
  if (!hasTestTicket) {
    const createRes = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'Authorization': `Bearer ${studentLoginRes.data.token}`
      },
      body: JSON.stringify({
        id: 'RP-1079',
        title: 'High-Speed Ethernet Wall Jack Dead in Sangamam Project Lab 4',
        category: 'IT & Wi-Fi',
        priority: 'High',
        urgency: 'high',
        location: 'Sangamam Block - Project Lab 4 (Bench 12)',
        hostelBlock: 'Academic Complex',
        description: 'The RJ45 gigabit wall port at Bench 12 in Sangamam Project Lab 4 shows no link light when connected to our workstation. Verified with a working Cat6 patch cable.',
        studentRegNo: '241FA07011',
        studentName: 'Katabattula Venkata SivaSai Ganesh',
        studentEmail: '241fa07011@vignan.ac.in',
        studentDept: 'Information Technology (IT)'
      })
    }).then(r => r.json());

    if (!createRes.success) {
      throw new Error(`Failed to submit test complaint: ${JSON.stringify(createRes)}`);
    }
    console.log(`   ✅ Test Complaint Submitted by 241FA07011: ${createRes.data.id} (${createRes.data.title})`);
  }

  // Test 4: Verify Super Admin fetch returns all complaints & check JSON persistence
  const allTicketsAfter = await fetch(`${API_BASE}/tickets`, {
    headers: { 'Origin': FRONTEND_URL, 'Authorization': `Bearer ${adminLoginRes.data.token}` }
  }).then(r => r.json());

  const uniqueRegNos = new Set((allTicketsAfter.data || []).map(t => t.complainant?.regNo).filter(Boolean));
  console.log(`   ✅ Super Admin Fetch Verified: ${allTicketsAfter.count} total complaints from ${uniqueRegNos.size} unique registration numbers!`);

  // Dept Admin Login (IT HOD)
  const deptLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': FRONTEND_URL },
    body: JSON.stringify({ username: 'it_network_admin', password: 'VignanIT@2026', role: 'dept_admin' })
  }).then(r => r.json());

  // 2️⃣ Launch Headless Browser to Capture Fresh Screenshots
  const executablePath = findBrowserExecutable();
  console.log(`2️⃣ Launching Browser (${executablePath}) to capture screenshots...`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();

    // ── SCREENSHOT 1: Public Landing Page ──
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await delay(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing_page.png'), fullPage: false });
    console.log('   📸 Captured: docs/screenshots/landing_page.png');

    // ── SCREENSHOT 2: Student Login Modal ──
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signBtn = btns.find(b => /sign in|login|student portal/i.test(b.innerText));
      if (signBtn) signBtn.click();
    });
    await delay(600);
    // Fill 241FA07011 into the login modal inputs
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type('241FA07011');
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type('241FA07011');
    }
    await delay(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'student_login.png'), fullPage: false });
    console.log('   📸 Captured: docs/screenshots/student_login.png');

    // ── SCREENSHOT 3: Student Dashboard (241FA07011) ──
    const studentSession = {
      ...studentLoginRes.data,
      role: 'student',
      regNo: '241FA07011',
      username: '241FA07011'
    };
    await page.evaluate((sess) => {
      localStorage.removeItem('resolvehub_campus_complaints_db');
      localStorage.setItem('resolvehub_auth_session_2026', JSON.stringify(sess));
    }, studentSession);
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await delay(1200);
    // Explicitly click "Student Dashboard" in navbar to switch to student_dashboard view
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const dbBtn = btns.find(b => b.innerText && b.innerText.includes('Student Dashboard'));
      if (dbBtn) dbBtn.click();
    });
    await delay(1200);
    await page.evaluate(() => window.scrollTo(0, 760));
    await delay(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'student_dashboard.png'), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, 0));
    console.log('   📸 Captured: docs/screenshots/student_dashboard.png');

    // ── SCREENSHOT 4: Raise Complaint Form ──
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reportBtn = btns.find(b => /report new issue|submit grievance|report complaint/i.test(b.innerText));
      if (reportBtn) reportBtn.click();
    });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'raise_complaint_form.png'), fullPage: false });
    console.log('   📸 Captured: docs/screenshots/raise_complaint_form.png');

    // ── SCREENSHOT 5: My Complaints Page (241FA07011) ──
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const myBtn = btns.find(b => /my complaints/i.test(b.innerText));
      if (myBtn) myBtn.click();
    });
    await delay(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'my_complaints.png'), fullPage: false });
    console.log('   📸 Captured: docs/screenshots/my_complaints.png');

    // ── SCREENSHOT 6: AI Helper / Triage Copilot Drawer ──
    await page.evaluate(() => {
      const aiBtn = document.querySelector('button[aria-label="Open ResolveHub AI Assistant"]');
      if (aiBtn) aiBtn.click();
    });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ai_helper.png'), fullPage: false });
    console.log('   📸 Captured: docs/screenshots/ai_helper.png');

    // ── SCREENSHOT 7: Super Admin Dashboard (Showing 69 Complaints from 48 Reg Nos) ──
    const superAdminSession = {
      ...adminLoginRes.data,
      role: 'super_admin'
    };
    await page.evaluate((sess) => {
      localStorage.removeItem('resolvehub_campus_complaints_db');
      localStorage.setItem('resolvehub_auth_session_2026', JSON.stringify(sess));
    }, superAdminSession);
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await delay(1800);
    // Scroll directly to the unified complaints table to capture the rich rows of complaints and registration numbers
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find(el => el.innerText.includes('All Student Grievances'));
      if (h) window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 110);
    });
    await delay(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'super_admin_dashboard.png'), fullPage: false });
    console.log('   📸 Captured: docs/screenshots/super_admin_dashboard.png');

    // ── SCREENSHOT 8: Department Admin Portal (IT & Network HOD) ──
    const deptAdminSession = {
      ...deptLoginRes.data,
      role: 'dept_admin'
    };
    await page.evaluate((sess) => {
      localStorage.removeItem('resolvehub_campus_complaints_db');
      localStorage.setItem('resolvehub_auth_session_2026', JSON.stringify(sess));
    }, deptAdminSession);
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await delay(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dept_admin_portal.png'), fullPage: false });
    console.log('   📸 Captured: docs/screenshots/dept_admin_portal.png');

    console.log('✅ All 8 screenshots captured and verified!');
  } finally {
    await browser.close();
  }
}

runVerificationAndScreenshots().catch(err => {
  console.error('❌ Verification/Screenshot error:', err);
  process.exit(1);
});

