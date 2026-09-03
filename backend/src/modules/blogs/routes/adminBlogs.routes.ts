import { Router } from "express";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import {
  getAdminBlogs,
  createAdminBlog,
  updateAdminBlog,
  updateAdminBlogStatus,
  deleteAdminBlog
} from "../controllers/adminBlogs.controller";

export const adminBlogsRouter = Router();

adminBlogsRouter.use(authenticateAdmin);

adminBlogsRouter.get("/", getAdminBlogs);
adminBlogsRouter.post("/", createAdminBlog);
adminBlogsRouter.put("/:id", updateAdminBlog);
adminBlogsRouter.patch("/:id/status", updateAdminBlogStatus);
adminBlogsRouter.delete("/:id", deleteAdminBlog);
