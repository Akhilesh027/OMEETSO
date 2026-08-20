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

// Public routes
jobsRouter.get("/categories", getJobCategories);
jobsRouter.get("/", getPublicJobs);
jobsRouter.get("/:id", getJobById);

// Candidate routes (authenticated)
jobsRouter.get("/candidate/profile", authenticateUser, getCandidateProfile);
jobsRouter.put("/candidate/profile", authenticateUser, updateCandidateProfile);
jobsRouter.post("/apply", authenticateUser, applyToJob);
jobsRouter.get("/candidate/applications", authenticateUser, getCandidateApplications);
jobsRouter.post("/candidate/applications/:applicationId/withdraw", authenticateUser, withdrawApplication);

// Employer routes (authenticated)
jobsRouter.post("/", authenticateUser, createJobListing);
jobsRouter.get("/employer/my-jobs", authenticateUser, getEmployerJobs);
jobsRouter.post("/:id/duplicate", authenticateUser, duplicateJobListing);
jobsRouter.post("/:id/renew", authenticateUser, renewJobListing);
jobsRouter.post("/:id/close", authenticateUser, closeJobListing);
jobsRouter.get("/:jobId/applicants", authenticateUser, getJobApplicants);
jobsRouter.patch("/applicants/:applicationId/status", authenticateUser, updateApplicantStatus);
