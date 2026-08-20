import { Router } from "express";
import { authenticateUser } from "../../../middleware/authenticateUser";
import {
  getServiceCategories,
  getPublicServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  createServiceInquiry,
  getMyServiceInquiries,
  getProviderInquiries,
  updateInquiryStatus,
  getProviderProfile,
  updateProviderProfile,
} from "../controllers/services.controller";

export const servicesRouter = Router();

// Public routes
servicesRouter.get("/categories", getServiceCategories);
servicesRouter.get("/", getPublicServices);
servicesRouter.get("/:id", getServiceById);

// Customer routes (authenticated)
servicesRouter.post("/inquiries", authenticateUser, createServiceInquiry);
servicesRouter.get("/customer/inquiries", authenticateUser, getMyServiceInquiries);

// Provider routes (authenticated)
servicesRouter.post("/", authenticateUser, createService);
servicesRouter.get("/provider/my-services", authenticateUser, getMyServices);
servicesRouter.put("/:id", authenticateUser, updateService);
servicesRouter.delete("/:id", authenticateUser, deleteService);
servicesRouter.get("/provider/inquiries", authenticateUser, getProviderInquiries);
servicesRouter.patch("/inquiries/:inquiryId/status", authenticateUser, updateInquiryStatus);
servicesRouter.get("/provider/profile", authenticateUser, getProviderProfile);
servicesRouter.put("/provider/profile", authenticateUser, updateProviderProfile);
