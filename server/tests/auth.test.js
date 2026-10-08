const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { app, server } = require('../index');
const { connectDB } = require('../db');

jest.setTimeout(30000);

describe('ResolveHub Authentication & Account Verification API Tests', () => {
  beforeAll(async () => {
    await connectDB();
  }, 30000);

  afterAll(async () => {
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Super Admin Authentication', () => {
    it('should allow Super Admin to login with valid credentials', async () => {
      const superAdminUsername = process.env.SUPERADMIN_USERNAME || 'ksaiganesh64';
      const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611';

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: superAdminUsername,
          password: superAdminPassword,
          role: 'super_admin'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.role).toEqual('super_admin');
    });

    it('should reject Super Admin login with invalid password', async () => {
      const superAdminUsername = process.env.SUPERADMIN_USERNAME || 'ksaiganesh64';

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: superAdminUsername,
          password: 'wrongpassword123!',
          role: 'super_admin'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid credentials/i);
    });
  });

  describe('2. Unregistered Student Login', () => {
    it('should return 401 for student login without an active account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: '999XX00000',
          regNo: '999XX00000',
          password: 'Password123!',
          role: 'student'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid credentials/i);
    });
  });

  describe('3. Student Registration & Approval Flow', () => {
    const studentRegNo = `TESTREG${Math.floor(1000 + Math.random() * 9000)}`;
    const studentPassword = 'MySecretPass123!';
    let requestId = '';
    let superAdminToken = '';

    beforeAll(async () => {
      const adminRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: process.env.SUPERADMIN_USERNAME || 'ksaiganesh64',
          password: process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611'
        });
      superAdminToken = adminRes.body.data.token;
    });

    it('should allow student to submit account registration request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup-request')
        .send({
          regNo: studentRegNo,
          fullName: 'Test Student',
          email: `${studentRegNo.toLowerCase()}@vignan.ac.in`,
          department: 'Computer Science & Engineering',
          year: '3rd Year',
          password: studentPassword,
          confirmPassword: studentPassword
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      requestId = res.body.data.id;
    });

    it('should block login while student request is pending', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: studentRegNo,
          regNo: studentRegNo,
          password: studentPassword,
          role: 'student'
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/awaiting Super Admin approval/i);
    });

    it('should allow Super Admin to approve student signup request', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/signup-requests/${requestId}/approve`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(['APPROVED', 'ACTIVE']).toContain(res.body.data.status);
    });

    it('should allow approved student to log in with their chosen password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: studentRegNo,
          regNo: studentRegNo,
          password: studentPassword,
          role: 'student'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.regNo).toEqual(studentRegNo);
    });

    it('should reject approved student login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: studentRegNo,
          regNo: studentRegNo,
          password: 'wrongstudentpassword',
          role: 'student'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Student Registration Rejection Flow', () => {
    const studentRegNo = `REJREG${Math.floor(1000 + Math.random() * 9000)}`;
    let requestId = '';
    let superAdminToken = '';

    beforeAll(async () => {
      const adminRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: process.env.SUPERADMIN_USERNAME || 'ksaiganesh64',
          password: process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611'
        });
      superAdminToken = adminRes.body.data.token;
    });

    it('should submit registration request and reject it with reason', async () => {
      const reqRes = await request(app)
        .post('/api/v1/auth/signup-request')
        .send({
          regNo: studentRegNo,
          fullName: 'Rejected Student',
          email: `${studentRegNo.toLowerCase()}@vignan.ac.in`,
          department: 'Information Technology (IT)',
          year: '2nd Year',
          password: 'PassWord123!',
          confirmPassword: 'PassWord123!'
        });
      requestId = reqRes.body.data.id;

      const rejRes = await request(app)
        .post(`/api/v1/auth/signup-requests/${requestId}/reject`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Invalid registration number provided' });

      expect(rejRes.statusCode).toEqual(200);
      expect(rejRes.body.success).toBe(true);
      expect(rejRes.body.data.status).toEqual('REJECTED');
    });

    it('should return rejection reason when student attempts to log in', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: studentRegNo,
          regNo: studentRegNo,
          password: 'PassWord123!',
          role: 'student'
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/rejected/i);
    });
  });

  describe('5. Avatar Upload Validation', () => {
    let userToken = '';

    beforeAll(async () => {
      const adminRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: process.env.SUPERADMIN_USERNAME || 'ksaiganesh64',
          password: process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611'
        });
      userToken = adminRes.body.data.token;
    });

    it('should reject avatar upload if file is not an image (e.g. text file)', async () => {
      const testBuffer = Buffer.from('console.log("malicious file");');

      const res = await request(app)
        .put('/api/v1/auth/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('avatar', testBuffer, { filename: 'script.js', contentType: 'text/javascript' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid image type/i);
    });
  });
});
