import CategoryRepository from "../repositories/categoryRepository";
import { Types } from "mongoose";
import { IEventTypeDocument } from "../models/eventTypes";
import { ICategoryService } from "./interfaces/ICategoryService";

class CategoryService implements ICategoryService{
  async getAllCategories(): Promise<IEventTypeDocument[]> {
    try {
      return await CategoryRepository.findAll();
    } catch (error) {
      console.error("Error in CategoryService.getAllCategories:", error);
      throw error;
    }
  }

  async createCategory(data: { name: string; description: string }): Promise<IEventTypeDocument> {
    try {
      const existingCategory = await CategoryRepository.findByName(data.name);
      if (existingCategory) {
        const error: any = new Error("Category with this name already exists");
        error.code = "DUPLICATE_NAME";
        throw error;
      }

      return await CategoryRepository.create(data);
    } catch (error) {
      console.error("Error in CategoryService.createCategory:", error);
      throw error;
    }
  }

  async updateCategory(
    id: string,
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument | null> {
    try {
      console.log(id);
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID");
      }

      const existingCategory = await CategoryRepository.findById(id);
      if (!existingCategory) {
        const error: any = new Error("Category not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      if (existingCategory.name !== data.name) {
        const nameExists = await CategoryRepository.findByName(data.name);
        if (nameExists) {
          const error: any = new Error("Category with this name already exists");
          error.code = "DUPLICATE_NAME";
          throw error;
        }
      }

      return await CategoryRepository.update(id, data);
    } catch (error) {
      console.error("Error in CategoryService.updateCategory:", error);
      throw error;
    }
  }
}

export default new CategoryService();
