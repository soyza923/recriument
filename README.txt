========================================================================
SE2020 - WEB AND MOBILE TECHNOLOGIES INDIVIDUAL ASSIGNMENT
SUBMISSION DOCUMENTATION & REPOSITORY LINK
========================================================================

01). Repo Contents:
  ├── backend/    (Node.js + Express.js + Mongoose + JWT + Multer)
  └── frontend/   (React Native / React Native Web App + Tailwind CSS)


02). Student Details
------------------------------------------------------------------------
System Topic: Web-Based Recruitment Company System (TalentHub)
Student ID:   IT22640420 
Student Name: SOYZA R M C L
Module:       SE2020 - Web and Mobile Technologies (Year 2 Semester 2 - 2026)


03). Deployment Details


Configured Environment Variable Names (.env):
  - PORT
  - MONGODB_URI
  - JWT_SECRET
  - NODE_ENV


04). System Architecture & Core Entities
------------------------------------------------------------------------
Primary Entity: JobPosting (Full CRUD + Multer Image Upload + maxApplicants capacity threshold)
Related Entity: Application (Full CRUD + jobId/applicantId references + status state transitions)

Business Logic Rules Enforced:
  1. Capacity Enforcement: Application creation blocked if JobPosting is Closed or full.
  2. Auto-Closing: Reaching max capacity automatically flips job status to 'Closed'.
  3. Capacity Release: Withdrawing an application decrements count and reopens job to 'Open'.
  4. Duplicate Guard: Compound index (jobId, applicantId) prevents duplicate submissions (409 Conflict).
========================================================================
