import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  getCategoryFormSchema,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categories.controller";

export const categoriesRouter = Router();

categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:categoryId", getCategoryById);
categoriesRouter.get("/:categoryId/form-schema", getCategoryFormSchema);

categoriesRouter.post("/", createCategory);
categoriesRouter.put("/:categoryId", updateCategory);
categoriesRouter.patch("/:categoryId", updateCategory);
categoriesRouter.delete("/:categoryId", deleteCategory);
