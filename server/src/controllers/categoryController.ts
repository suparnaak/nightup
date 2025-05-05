import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import TYPES from "../config/di/types";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { isRequired } from "../utils/validators";
import { ICategoryController } from "./interfaces/ICategoryController";
import { ICategoryService } from "../services/interfaces/ICategoryService";
import { IEventTypeDocument } from "../models/eventTypes";

@injectable()
export class CategoryController implements ICategoryController {

  constructor(
    @inject(TYPES.CategoryService)
    private categoryService: ICategoryService
  ) {}

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.getAllCategories();
      console.log(categories);
      const payload = categories.map((cat: IEventTypeDocument) => ({
        id: String(cat._id), 
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

      const category = await this.categoryService.createCategory({ name, description });
      
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

      const category = await this.categoryService.updateCategory(id, { name, description });

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

//export default new CategoryController();