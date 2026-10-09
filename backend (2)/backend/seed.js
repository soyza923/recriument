const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const JobPosting = require('./models/JobPosting');
const Application = require('./models/Application');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recruitment_system_db');
    console.log('[Seed] Database connected for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await Application.deleteMany({});

    console.log('[Seed] Existing collections cleared.');

    // 1. Create Users (Employers and Jobseekers)
    const employer1 = await User.create({
      name: 'Sarah Jenkins (TechCorp HR)',
      email: 'hr@techcorp.com',
      password: 'password123',
      role: 'employer',
      phone: '+1-555-0192',
    });

    const employer2 = await User.create({
      name: 'Marcus Vance (FinTech Solutions)',
      email: 'careers@fintechsolutions.io',
      password: 'password123',
      role: 'employer',
      phone: '+1-555-0834',
    });

    const jobseeker1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      password: 'password123',
      role: 'jobseeker',
      phone: '+1-555-4921',
    });

    const jobseeker2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@outlook.com',
      password: 'password123',
      role: 'jobseeker',
      phone: '+1-555-8392',
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@recruitment.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+1-555-0000',
    });

    console.log('[Seed] Users seeded successfully.');

    // 2. Create Job Postings (Primary Entities)
    const job1 = await JobPosting.create({
      title: 'Senior Full Stack React Native / Node Developer',
      companyName: 'TechCorp Solutions',
      description: 'We are seeking an experienced React Native and Node.js developer to build enterprise mobile applications. Minimum 3+ years experience with REST APIs and MongoDB.',
      location: 'San Francisco, CA (Hybrid)',
      jobType: 'Full-time',
      salaryRange: '$120,000 - $145,000 / year',
      category: 'Software Engineering',
      maxApplicants: 2, // Low capacity to test business logic full state!
      currentApplicants: 1,
      status: 'Open',
      companyLogo: '',
      postedBy: employer1._id,
    });

    const job2 = await JobPosting.create({
      title: 'Lead Mobile UI/UX Designer',
      companyName: 'FinTech Solutions Inc.',
      description: 'Looking for a creative UI/UX designer with experience designing high-converting mobile apps, Figma design systems, and user flow wireframes.',
      location: 'Remote',
      jobType: 'Remote',
      salaryRange: '$95,000 - $115,000 / year',
      category: 'Design & Product',
      maxApplicants: 5,
      currentApplicants: 1,
      status: 'Open',
      companyLogo: '',
      postedBy: employer2._id,
    });

    const job3 = await JobPosting.create({
      title: 'Backend Node.js API Architect',
      companyName: 'TechCorp Solutions',
      description: 'Architect scalable microservices, manage MongoDB databases, and build secure OAuth2/JWT authentication systems.',
      location: 'New York, NY',
      jobType: 'Contract',
      salaryRange: '$80 - $100 / hour',
      category: 'Backend Engineering',
      maxApplicants: 3,
      currentApplicants: 0,
      status: 'Open',
      companyLogo: '',
      postedBy: employer1._id,
    });

    console.log('[Seed] Job Postings (Primary Entities) seeded.');

    // 3. Create Applications (Related Entities referencing JobPosting and User)
    const app1 = await Application.create({
      jobId: job1._id,
      applicantId: jobseeker1._id,
      applicantName: jobseeker1.name,
      applicantEmail: jobseeker1.email,
      coverLetter: 'I have 4 years of experience building React Native mobile apps and Express backend APIs. Excited to apply for TechCorp!',
      experienceYears: 4,
      resumeUrl: 'https://example.com/resumes/alex-rivera-cv.pdf',
      status: 'Shortlisted',
    });

    const app2 = await Application.create({
      jobId: job2._id,
      applicantId: jobseeker2._id,
      applicantName: jobseeker2.name,
      applicantEmail: jobseeker2.email,
      coverLetter: 'Passionate about mobile design systems, accessibility, and clean component architecture.',
      experienceYears: 3,
      resumeUrl: 'https://example.com/resumes/elena-rostova-portfolio.pdf',
      status: 'Pending',
    });

    console.log('[Seed] Applications (Related Entities) seeded.');
    console.log('[Seed] Database Seeding Complete!');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
