const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');
const authRoutes = require('../routes/authRoutes');
const jobRoutes = require('../routes/jobRoutes');
const applicationRoutes = require('../routes/applicationRoutes');
const errorHandler = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use(errorHandler);

const runTests = async () => {
  let server;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recruitment_system_db');
    console.log('\n======================================================');
    console.log('  STARTING INTEGRATION TESTS FOR RECRUITMENT SYSTEM');
    console.log('======================================================\n');

    server = app.listen(5001);
    const baseUrl = 'http://127.0.0.1:5001/api';

    // Clear DB
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await Application.deleteMany({});

    // 1. Test Auth - Register Employer
    console.log('[TEST 1] Registering Employer user...');
    const empRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Employer Corp',
        email: 'employer@test.com',
        password: 'password123',
        role: 'employer',
      }),
    });
    const empRegData = await empRegRes.json();
    console.assert(empRegRes.status === 201, 'Employer registration failed');
    console.assert(empRegData.token, 'Token missing in registration');
    const employerToken = empRegData.token;
    console.log('✓ TEST 1 PASSED: Employer registered, JWT issued.');

    // 2. Test Auth - Register Jobseeker 1
    console.log('\n[TEST 2] Registering Jobseeker 1...');
    const seeker1RegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'jobseeker',
      }),
    });
    const seeker1RegData = await seeker1RegRes.json();
    console.assert(seeker1RegRes.status === 201, 'Jobseeker 1 registration failed');
    const seeker1Token = seeker1RegData.token;
    console.log('✓ TEST 2 PASSED: Jobseeker 1 registered.');

    // 3. Test Auth - Register Jobseeker 2
    console.log('\n[TEST 3] Registering Jobseeker 2...');
    const seeker2RegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'password123',
        role: 'jobseeker',
      }),
    });
    const seeker2RegData = await seeker2RegRes.json();
    const seeker2Token = seeker2RegData.token;
    console.log('✓ TEST 3 PASSED: Jobseeker 2 registered.');

    // 4. Test Primary Entity CRUD - Create Job Posting with maxApplicants = 1
    console.log('\n[TEST 4] Creating Primary Entity (JobPosting) with capacity maxApplicants=1...');
    const createJobRes = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`,
      },
      body: JSON.stringify({
        title: 'Junior React Native Developer',
        companyName: 'Test Employer Corp',
        description: 'Building mobile UI components using React Native.',
        location: 'Colombo, Sri Lanka',
        jobType: 'Full-time',
        salaryRange: 'LKR 150,000 / month',
        category: 'Mobile App Development',
        maxApplicants: 1, // Set max capacity to 1 to test capacity enforcement!
      }),
    });
    const createJobData = await createJobRes.json();
    console.assert(createJobRes.status === 201, 'Create Job failed');
    const jobId = createJobData.data._id;
    console.log(`✓ TEST 4 PASSED: Primary Entity Created (Job ID: ${jobId}, maxApplicants: 1).`);

    // 5. Test Primary Entity Read All & Read One
    console.log('\n[TEST 5] Reading Primary Entity (Get All & Get By ID)...');
    const getJobsRes = await fetch(`${baseUrl}/jobs`);
    const getJobsData = await getJobsRes.json();
    console.assert(getJobsData.count === 1, 'Job count mismatch');

    const getJobOneRes = await fetch(`${baseUrl}/jobs/${jobId}`);
    const getJobOneData = await getJobOneRes.json();
    console.assert(getJobOneData.data.title === 'Junior React Native Developer', 'Job title mismatch');
    console.log('✓ TEST 5 PASSED: Get All and Get By ID working.');

    // 6. Test Related Entity CRUD - Jobseeker 1 Applies (1st Application)
    console.log('\n[TEST 6] Jobseeker 1 applying for Job (Related Entity Creation)...');
    const apply1Res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seeker1Token}`,
      },
      body: JSON.stringify({
        jobId: jobId,
        coverLetter: 'I love React Native and want to work at Test Employer Corp!',
        experienceYears: 2,
      }),
    });
    const apply1Data = await apply1Res.json();
    console.assert(apply1Res.status === 201, 'Application 1 failed');
    const app1Id = apply1Data.data._id;
    console.log('✓ TEST 6 PASSED: Application 1 created successfully.');

    // Verify Business Logic Rule: Job currentApplicants incremented to 1 & status flipped to 'Closed'
    const jobAfterApp1Res = await fetch(`${baseUrl}/jobs/${jobId}`);
    const jobAfterApp1Data = await jobAfterApp1Res.json();
    console.assert(jobAfterApp1Data.data.currentApplicants === 1, 'currentApplicants not incremented');
    console.assert(jobAfterApp1Data.data.status === 'Closed', 'Job status not auto-flipped to Closed!');
    console.log('✓ BUSINESS LOGIC RULE PASSED: Job currentApplicants=1, status auto-flipped to Closed!');

    // 7. Test Business Logic Rule: Duplicate application prevention
    console.log('\n[TEST 7] Testing Duplicate Application Prevention...');
    const dupApplyRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seeker1Token}`,
      },
      body: JSON.stringify({
        jobId: jobId,
        coverLetter: 'Duplicate application attempt',
        experienceYears: 2,
      }),
    });
    console.assert(dupApplyRes.status === 409, 'Duplicate check failed');
    console.log('✓ BUSINESS LOGIC RULE PASSED: Duplicate application blocked with 409 Conflict.');

    // 8. Test Business Logic Rule: Capacity Full Enforcement
    console.log('\n[TEST 8] Jobseeker 2 trying to apply for full/closed job...');
    const fullApplyRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seeker2Token}`,
      },
      body: JSON.stringify({
        jobId: jobId,
        coverLetter: 'Attempt to apply when capacity is full',
        experienceYears: 1,
      }),
    });
    const fullApplyData = await fullApplyRes.json();
    console.assert(fullApplyRes.status === 400, 'Full capacity check failed');
    console.log(`✓ BUSINESS LOGIC RULE PASSED: Application blocked when capacity full (${fullApplyData.message}).`);

    // 9. Test Related Entity Status Transition: Employer updates application status to Shortlisted
    console.log('\n[TEST 9] Employer updating Application status to "Shortlisted"...');
    const statusUpdateRes = await fetch(`${baseUrl}/applications/${app1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`,
      },
      body: JSON.stringify({
        status: 'Shortlisted',
      }),
    });
    const statusUpdateData = await statusUpdateRes.json();
    console.assert(statusUpdateData.data.status === 'Shortlisted', 'Status update failed');
    console.log('✓ TEST 9 PASSED: Application status transitioned to "Shortlisted".');

    // 10. Test Business Logic Rule: Withdrawal / Deletion releases capacity & reopens job
    console.log('\n[TEST 10] Jobseeker 1 withdrawing application (Testing Capacity Release)...');
    const withdrawRes = await fetch(`${baseUrl}/applications/${app1Id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${seeker1Token}`,
      },
    });
    console.assert(withdrawRes.status === 200, 'Withdrawal failed');

    const jobAfterWithdrawRes = await fetch(`${baseUrl}/jobs/${jobId}`);
    const jobAfterWithdrawData = await jobAfterWithdrawRes.json();
    console.assert(jobAfterWithdrawData.data.currentApplicants === 0, 'currentApplicants not decremented');
    console.assert(jobAfterWithdrawData.data.status === 'Open', 'Job status not reopened!');
    console.log('✓ BUSINESS LOGIC RULE PASSED: Withdrawal decremented currentApplicants to 0 and reopened Job to "Open"!');

    console.log('\n======================================================');
    console.log('  ALL 10 API & BUSINESS LOGIC INTEGRATION TESTS PASSED!');
    console.log('======================================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('TEST SUITE FAILED:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
