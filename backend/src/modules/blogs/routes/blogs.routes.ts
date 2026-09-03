import { Router } from "express";
import {
  getPublicBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  likeBlog
} from "../controllers/blogs.controller";

export const blogsRouter = Router();

blogsRouter.get("/", getPublicBlogs);
blogsRouter.get("/featured", getFeaturedBlogs);
blogsRouter.get("/:slug", getBlogBySlug);
blogsRouter.post("/:id/like", likeBlog);
