import { Router } from "express";
import { authenticateUser } from "../../../middleware/authenticateUser";
import {
  getJobCategories,
  getPublicJobs,
  getJobById,
  createJobListing,
  duplicateJobListing,
  renewJobListing,
  closeJobListing,
  applyToJob,
  withdrawApplication,
  getCandidateApplications,
  getEmployerJobs,
  getJobApplicants,
  updateApplicantStatus,
  getCandidateProfile,
  updateCandidateProfile,
} from "../controllers/jobs.controller";

export const jobsRouter = Router();

// Candidate routes (authenticated)
jobsRouter.get("/candidate/profile", authenticateUser, getCandidateProfile);
jobsRouter.put("/candidate/profile", authenticateUser, updateCandidateProfile);
jobsRouter.post("/apply", authenticateUser, applyToJob);
jobsRouter.get("/candidate/applications", authenticateUser, getCandidateApplications);
jobsRouter.post("/candidate/applications/:applicationId/withdraw", authenticateUser, withdrawApplication);

// Employer routes (authenticated)
jobsRouter.get("/employer/my-jobs", authenticateUser, getEmployerJobs);
jobsRouter.get("/employer/applicants", authenticateUser, getJobApplicants);
jobsRouter.post("/", authenticateUser, createJobListing);
jobsRouter.get("/:jobId/applicants", authenticateUser, getJobApplicants);
jobsRouter.patch("/applicants/:applicationId/status", authenticateUser, updateApplicantStatus);
jobsRouter.post("/:id/duplicate", authenticateUser, duplicateJobListing);
jobsRouter.post("/:id/renew", authenticateUser, renewJobListing);
jobsRouter.post("/:id/close", authenticateUser, closeJobListing);

// Public routes
jobsRouter.get("/categories", getJobCategories);
jobsRouter.get("/", getPublicJobs);
jobsRouter.get("/:id", getJobById);
