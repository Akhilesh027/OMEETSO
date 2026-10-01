import { Router } from "express";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import {
  getAdminBlogs,
  createAdminBlog,
  updateAdminBlog,
  updateAdminBlogStatus,
  deleteAdminBlog,
  bulkBlockBlogs,
  dateWiseBlockBlogs,
  uploadBlogImage,
  syncAllBlogsToCloudinary
} from "../controllers/adminBlogs.controller";

export const adminBlogsRouter = Router();

adminBlogsRouter.use(authenticateAdmin);

adminBlogsRouter.get("/", getAdminBlogs);
adminBlogsRouter.post("/upload-image", uploadBlogImage);
adminBlogsRouter.post("/sync-cloudinary", syncAllBlogsToCloudinary);
adminBlogsRouter.post("/bulk-block", bulkBlockBlogs);
adminBlogsRouter.post("/date-wise-block", dateWiseBlockBlogs);
adminBlogsRouter.post("/", createAdminBlog);
adminBlogsRouter.put("/:id", updateAdminBlog);
adminBlogsRouter.patch("/:id/status", updateAdminBlogStatus);
adminBlogsRouter.delete("/:id", deleteAdminBlog);
