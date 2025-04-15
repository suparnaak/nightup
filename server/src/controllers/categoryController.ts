import { Request, Response } from "express";
import CategoryService from "../services/categoryService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { isRequired } from "../utils/validators";
import { ICategoryController } from "./interfaces/ICategoryController";
import { IEventTypeDocument } from "../models/eventTypes";

class CategoryController implements ICategoryController {
  // GET: Fetch all categories (event types)
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryService.getAllCategories();
      console.log(categories);
      const payload = categories.map((cat: IEventTypeDocument) => ({
        id: String(cat._id), // Now TypeScript knows _id exists on cat
        name: cat.name,
        description: cat.description,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      }));
      
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        categories: payload,
      });
    } catch (error) {
      console.error("Get Categories Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  // POST: Create new category (event type)
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;

      if (!isRequired(name) || !isRequired(description)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_CATEGORY_NAME || "Name and description are required.",
        });
        return;
      }

      const category = await CategoryService.createCategory({ name, description });
      
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.CATEGORY_CREATED || "Event type created successfully",
        category,
      });
    } catch (error: any) {
      console.error("Create Category Error:", error);
      
      if (error.code === "DUPLICATE_NAME") {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "An event type with this name already exists",
        });
        return;
      }
      
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  // PUT: Update category (event type) by ID
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
     
      const { id } = req.params;
      console.log(req.params)
      const { name, description } = req.body;

      if (!isRequired(name) || !isRequired(description)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_CATEGORY_NAME || "Name and description are required.",
        });
        return;
      }

      const category = await CategoryService.updateCategory(id, { name, description });

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.CATEGORY_UPDATED || "Event type updated successfully",
        category,
      });
    } catch (error: any) {
      console.error("Update Category Error:", error);
      
      if (error.code === "NOT_FOUND") {
        res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Event type not found",
        });
        return;
      }
      
      if (error.code === "DUPLICATE_NAME") {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "An event type with this name already exists",
        });
        return;
      }
      
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

}

export default new CategoryController();