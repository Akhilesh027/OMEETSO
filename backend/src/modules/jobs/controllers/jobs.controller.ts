import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Job } from "../models/Job";
import { JobApplication } from "../models/JobApplication";
import { CandidateProfile } from "../models/CandidateProfile";
import { JobCategory } from "../models/JobCategory";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";

// DEFAULT JOB CATEGORIES SEED DATA
const DEFAULT_JOB_CATEGORIES = [
  { id: "it_software", name: "IT & Software", icon: "Code", subcategories: ["Frontend Developer", "Backend Developer", "Full Stack", "Mobile App", "DevOps", "QA / Testing"] },
  { id: "sales_marketing", name: "Sales & Marketing", icon: "TrendingUp", subcategories: ["Field Sales", "Telecalling / Inside Sales", "Business Development", "Retail Sales"] },
  { id: "digital_marketing", name: "Digital Marketing", icon: "Share2", subcategories: ["SEO Specialist", "Social Media", "PPC / Ads Manager", "Content Creator"] },
  { id: "customer_support", name: "Customer Support", icon: "Headphones", subcategories: ["Voice Process", "Non-Voice / Chat", "Technical Support", "BPO"] },
  { id: "accounting_finance", name: "Accounting & Finance", icon: "Calculator", subcategories: ["Accountant", "Tax Consultant", "Audit", "Tally Operator"] },
  { id: "hr_recruitment", name: "HR & Recruitment", icon: "Users", subcategories: ["Recruiter", "HR Executive", "Payroll", "Talent Acquisition"] },
  { id: "administration", name: "Administration", icon: "Building", subcategories: ["Office Admin", "Receptionist", "Executive Assistant"] },
  { id: "delivery_logistics", name: "Delivery & Logistics", icon: "Truck", subcategories: ["Delivery Executive", "Logistics Coordinator", "Warehouse Executive"] },
  { id: "drivers", name: "Drivers", icon: "Car", subcategories: ["Car Driver", "Heavy Vehicle Driver", "Personal Driver", "Valet"] },
  { id: "retail_staff", name: "Retail Staff", icon: "ShoppingBag", subcategories: ["Store Manager", "Cashier", "Sales Associate"] },
  { id: "hotel_restaurant", name: "Hotel & Restaurant", icon: "Coffee", subcategories: ["Waiter / Waitress", "Front Desk", "Housekeeping", "Hotel Manager"] },
  { id: "cook_chef", name: "Cook / Chef", icon: "Utensils", subcategories: ["North Indian Cook", "South Indian Cook", "Chinese Chef", "Baker", "Kitchen Helper"] },
  { id: "security", name: "Security", icon: "Shield", subcategories: ["Security Guard", "Security Supervisor", "CCTV Monitor"] },
  { id: "housekeeping", name: "Housekeeping", icon: "Sparkles", subcategories: ["Housekeeper", "Cleaner", "Facility Manager"] },
  { id: "construction", name: "Construction", icon: "HardHat", subcategories: ["Site Engineer", "Supervisor", "Mason", "Painter"] },
  { id: "electrician", name: "Electrician", icon: "Zap", subcategories: ["Residential Electrician", "Industrial Electrician", "Appliance Technician"] },
  { id: "plumber", name: "Plumber", icon: "Droplet", subcategories: ["Pipe Fitter", "Plumbing Technician"] },
  { id: "carpenter", name: "Carpenter", icon: "Hammer", subcategories: ["Furniture Carpenter", "Interior Worker"] },
  { id: "mechanic", name: "Mechanic", icon: "Wrench", subcategories: ["Auto Mechanic", "Bike Mechanic", "AC Technician"] },
  { id: "healthcare", name: "Healthcare", icon: "Activity", subcategories: ["Nurse", "Lab Technician", "Pharmacist", "Clinic Assistant"] },
  { id: "education", name: "Education & Teaching", icon: "GraduationCap", subcategories: ["School Teacher", "Home Tutor", "College Lecturer", "Coaching Staff"] },
  { id: "beauty_salon", name: "Beauty & Salon", icon: "Scissors", subcategories: ["Beautician", "Hair Stylist", "Makeup Artist", "Spa Therapist"] },
  { id: "manufacturing", name: "Manufacturing", icon: "Factory", subcategories: ["Machine Operator", "Quality Control", "Production Assistant"] },
  { id: "data_entry", name: "Data Entry & Back Office", icon: "FileText", subcategories: ["Data Entry Operator", "Excel Specialist", "Back Office Assistant"] },
  { id: "work_from_home", name: "Work From Home", icon: "Home", subcategories: ["Online Tutor", "Telecaller", "Content Writer", "Data Entry"] },
  { id: "internships", name: "Internships", icon: "Award", subcategories: ["Software Intern", "Marketing Intern", "Design Intern", "Finance Intern"] },
  { id: "part_time", name: "Part-Time Jobs", icon: "Clock", subcategories: ["Evening Shift", "Weekend Jobs", "Student Jobs"] },
  { id: "other_jobs", name: "Other Jobs", icon: "Briefcase", subcategories: ["General Helper", "Event Staff", "Miscellaneous"] },
];

export async function getJobCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let categories: any[] = await JobCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    if (categories.length === 0) {
      const seeded = await JobCategory.insertMany(DEFAULT_JOB_CATEGORIES);
      categories = seeded.map((c: any) => (c.toObject ? c.toObject() : c));
    }
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getPublicJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {
      status: { $in: ["ACTIVE", "APPROVED", "active", "approved"] }
    };

    if (req.query.q) {
      const regex = new RegExp(req.query.q as string, "i");
      query.$or = [
        { title: regex },
        { companyName: regex },
        { "jobDetails.description": regex },
        { "candidateCriteria.skills": regex }
      ];
    }

    if (req.query.category || req.query.jobCategoryId) {
      query.jobCategoryId = (req.query.category || req.query.jobCategoryId) as string;
    }
    if (req.query.subcategory || req.query.subcategoryId) {
      query.subcategoryId = (req.query.subcategory || req.query.subcategoryId) as string;
    }
    if (req.query.jobType) {
      query.jobType = (req.query.jobType as string).toUpperCase();
    }
    if (req.query.workplaceType) {
      query.workplaceType = (req.query.workplaceType as string).toUpperCase();
    }
    if (req.query.isWalkIn === "true" || req.query.walkIn === "1") {
      query["walkInDetails.isWalkIn"] = true;
    }
    if (req.query.isUrgent === "true" || req.query.urgent === "1") {
      query.isUrgent = true;
    }
    if (req.query.isFeatured === "true" || req.query.featured === "1") {
      query.isFeatured = true;
    }
    if (req.query.fresher === "1" || req.query.fresherAllowed === "true") {
      query["candidateCriteria.fresherAllowed"] = true;
    }

    if (req.query.minSalary) {
      query["salary.minSalary"] = { $gte: parseInt(req.query.minSalary as string) };
    }
    if (req.query.maxSalary) {
      query["salary.maxSalary"] = { $lte: parseInt(req.query.maxSalary as string) };
    }

    // Location query
    if (req.query.city) {
      query["location.city"] = new RegExp((req.query.city as string).split(",")[0].trim(), "i");
    }
    if (req.query.area) {
      query["location.area"] = new RegExp((req.query.area as string).split(",")[0].trim(), "i");
    }

    // Posted Timeframe filter
    if (req.query.postedDays) {
      const days = parseInt(req.query.postedDays as string);
      if (!isNaN(days)) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: since };
      }
    }

    const sortOptions: Record<string, any> = { createdAt: -1 };
    if (req.query.sort === "salary_desc") sortOptions["salary.maxSalary"] = -1;
    if (req.query.sort === "salary_asc") sortOptions["salary.minSalary"] = 1;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: jobs.map((j: any) => ({ ...j, id: j._id.toString() })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid job ID" } });
      return;
    }

    const job = await Job.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }, { new: true }).lean();
    if (!job) {
      res.status(404).json({ success: false, error: { message: "Job not found" } });
      return;
    }

    // Fetch similar jobs & more jobs from company
    const [similarJobs, companyJobs] = await Promise.all([
      Job.find({
        _id: { $ne: job._id },
        jobCategoryId: job.jobCategoryId,
        status: { $in: ["ACTIVE", "APPROVED"] }
      }).limit(4).lean(),
      Job.find({
        _id: { $ne: job._id },
        companyName: job.companyName,
        status: { $in: ["ACTIVE", "APPROVED"] }
      }).limit(4).lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...job,
        id: job._id.toString(),
        similarJobs: similarJobs.map((j: any) => ({ ...j, id: j._id.toString() })),
        companyJobs: companyJobs.map((j: any) => ({ ...j, id: j._id.toString() }))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createJobListing(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const body = req.body;
    const job = await Job.create({
      employerId: req.user._id,
      storeId: body.storeId || undefined,
      companyName: body.companyName || req.user.profile?.name || "Company Partner",
      companyLogo: body.companyLogo || req.user.profile?.avatar,
      companyIndustry: body.companyIndustry || "General",
      companySize: body.companySize || "1-10 employees",
      companyDescription: body.companyDescription || "",
      isVerifiedEmployer: Boolean(req.user.verificationSummary?.mobileVerified),
      title: body.title,
      jobCategoryId: body.jobCategoryId || "it_software",
      subcategoryId: body.subcategoryId || "General",
      openingsCount: body.openingsCount || 1,
      jobType: body.jobType || "FULL_TIME",
      workplaceType: body.workplaceType || "OFFICE",
      location: body.location || { area: "Madhapur", city: "Hyderabad", pincode: "500081" },
      salary: body.salary || { minSalary: 25000, maxSalary: 40000, salaryPeriod: "monthly", salaryDisclosed: true },
      candidateCriteria: body.candidateCriteria || { experience: "1-2 Years", fresherAllowed: true, minEducation: "Graduate", skills: [] },
      jobDetails: body.jobDetails || { description: body.description || body.title },
      walkInDetails: body.walkInDetails || { isWalkIn: false },
      isUrgent: Boolean(body.isUrgent),
      isFeatured: Boolean(body.isFeatured),
      screeningQuestions: body.screeningQuestions || [],
      status: "ACTIVE"
    });

    res.status(201).json({ success: true, data: { ...job.toObject(), id: job._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function duplicateJobListing(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }
    const { id } = req.params;
    const existing = await Job.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: { message: "Original job not found" } });
      return;
    }

    const clonedData = existing.toObject();
    delete (clonedData as any)._id;
    delete (clonedData as any).createdAt;
    delete (clonedData as any).updatedAt;

    clonedData.title = `${clonedData.title} (Copy)`;
    clonedData.status = "ACTIVE";
    clonedData.viewsCount = 0;
    clonedData.applicationsCount = 0;
    clonedData.shortlistedCount = 0;
    clonedData.interviewsCount = 0;
    clonedData.hiredCount = 0;
    clonedData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newJob = await Job.create(clonedData);
    res.status(201).json({ success: true, data: { ...newJob.toObject(), id: newJob._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function renewJobListing(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }
    const { id } = req.params;
    const job = await Job.findOneAndUpdate(
      { _id: id, employerId: req.user._id },
      { status: "ACTIVE", expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { new: true }
    );

    if (!job) {
      res.status(404).json({ success: false, error: { message: "Job not found or access denied" } });
      return;
    }
    res.status(200).json({ success: true, data: { ...job.toObject(), id: job._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function closeJobListing(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }
    const { id } = req.params;
    const job = await Job.findOneAndUpdate(
      { _id: id, employerId: req.user._id },
      { status: "FILLED" },
      { new: true }
    );
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function applyToJob(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const { jobId, screeningAnswers, customSnapshot } = req.body;
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, error: { message: "Job listing not found" } });
      return;
    }

    if (job.status === "FILLED" || job.status === "EXPIRED") {
      res.status(400).json({ success: false, error: { message: "This position is no longer accepting applications." } });
      return;
    }

    // Check duplicate application
    const existing = await JobApplication.findOne({ jobId, applicantId: req.user._id });
    if (existing) {
      res.status(400).json({ success: false, error: { message: "You have already applied for this position." } });
      return;
    }

    // Get candidate profile
    const profile = await CandidateProfile.findOne({ userId: req.user._id });

    const application = await JobApplication.create({
      jobId: job._id,
      applicantId: req.user._id,
      employerId: job.employerId,
      applicantProfileSnapshot: {
        name: customSnapshot?.name || req.user.profile?.name || "Applicant",
        phone: customSnapshot?.phone || req.user.phone,
        email: customSnapshot?.email || req.user.email || "",
        city: customSnapshot?.city || profile?.city || "Hyderabad",
        resumeUrl: customSnapshot?.resumeUrl || profile?.resumeUrl,
        experience: customSnapshot?.experience || profile?.experienceYears || "Freshers Allowed",
        currentRole: customSnapshot?.currentRole || profile?.currentRole,
        currentCompany: customSnapshot?.currentCompany || profile?.currentCompany,
        currentSalary: customSnapshot?.currentSalary || profile?.expectedSalary,
        expectedSalary: customSnapshot?.expectedSalary || profile?.expectedSalary,
        noticePeriod: customSnapshot?.noticePeriod || profile?.noticePeriod || "Immediate"
      },
      screeningAnswers: screeningAnswers || [],
      status: "APPLIED"
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    res.status(201).json({ success: true, data: { ...application.toObject(), id: application._id.toString() } });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, error: { message: "You have already applied for this job." } });
      return;
    }
    next(err);
  }
}

export async function withdrawApplication(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const { applicationId } = req.params;
    const { reason } = req.body;

    const app = await JobApplication.findOneAndUpdate(
      { _id: applicationId, applicantId: req.user._id },
      { status: "WITHDRAWN", withdrawnAt: new Date(), withdrawalReason: reason || "Candidate withdrew" },
      { new: true }
    );

    if (!app) {
      res.status(404).json({ success: false, error: { message: "Application not found" } });
      return;
    }
    res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
}

export async function getCandidateApplications(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const applications = await JobApplication.find({ applicantId: req.user._id })
      .populate("jobId", "title companyName companyLogo location salary jobType workplaceType status")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: applications.map((a: any) => ({
        ...a,
        id: a._id.toString(),
        job: a.jobId ? { ...a.jobId, id: a.jobId._id.toString() } : null
      }))
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmployerJobs(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: jobs.map((j: any) => ({ ...j, id: j._id.toString() }))
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobApplicants(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const { jobId } = req.params;
    const { status, q, sort } = req.query;

    const query: Record<string, any> = { jobId, employerId: req.user._id };
    if (status && status !== "ALL") {
      query.status = (status as string).toUpperCase();
    }

    if (q) {
      const regex = new RegExp(q as string, "i");
      query.$or = [
        { "applicantProfileSnapshot.name": regex },
        { "applicantProfileSnapshot.email": regex },
        { "applicantProfileSnapshot.currentRole": regex },
        { "applicantProfileSnapshot.experience": regex }
      ];
    }

    let applications = await JobApplication.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: applications.map((a: any) => ({ ...a, id: a._id.toString() }))
    });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicantStatus(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const { applicationId } = req.params;
    const { status, interviewDetails, employerNotes } = req.body;

    const app = await JobApplication.findOneAndUpdate(
      { _id: applicationId, employerId: req.user._id },
      {
        status: status.toUpperCase(),
        ...(interviewDetails ? { interviewDetails } : {}),
        ...(employerNotes !== undefined ? { employerNotes } : {})
      },
      { new: true }
    );

    if (!app) {
      res.status(404).json({ success: false, error: { message: "Application not found or access denied" } });
      return;
    }

    // Update job counts
    if (status.toUpperCase() === "SHORTLISTED") {
      await Job.findByIdAndUpdate(app.jobId, { $inc: { shortlistedCount: 1 } });
    } else if (status.toUpperCase() === "INTERVIEW_SCHEDULED") {
      await Job.findByIdAndUpdate(app.jobId, { $inc: { interviewsCount: 1 } });
    } else if (status.toUpperCase() === "HIRED") {
      await Job.findByIdAndUpdate(app.jobId, { $inc: { hiredCount: 1 } });
    }

    res.status(200).json({ success: true, data: { ...app.toObject(), id: app._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function getCandidateProfile(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }
    let profile: any = await CandidateProfile.findOne({ userId: req.user._id }).lean();
    if (!profile) {
      const created = await CandidateProfile.create({
        userId: req.user._id,
        city: req.user.profile?.city || "Hyderabad"
      });
      profile = created.toObject();
    }
    if (!profile) {
      res.status(500).json({ success: false, error: { message: "Candidate profile not found" } });
      return;
    }
    res.status(200).json({ success: true, data: { ...profile, id: profile._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function updateCandidateProfile(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Unauthorized" } });
      return;
    }

    const updated = await CandidateProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    ).lean();

    res.status(200).json({ success: true, data: { ...updated, id: updated._id.toString() } });
  } catch (err) {
    next(err);
  }
}
