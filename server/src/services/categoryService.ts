import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { ICategoryRepository } from "../repositories/interfaces/ICategoryRepository";
import { Types } from "mongoose";
import { IEventTypeDocument } from "../models/eventTypes";
import { ICategoryService } from "./interfaces/ICategoryService";
import { MESSAGES } from "../utils/constants";

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject(TYPES.CategoryRepository)
    private categoryRepository: ICategoryRepository
  ) {}

  async getAllCategories(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    categories: IEventTypeDocument[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> {
    try {
      return await this.categoryRepository.findAll(page, limit);
    } catch (error) {
      console.error("Error in CategoryService.getAllCategories:", error);
      throw error;
    }
  }
  async createCategory(data: {
    name: string;
    description: string;
  }): Promise<IEventTypeDocument> {
    try {
      const existingCategory = await this.categoryRepository.findByName(
        data.name
      );
      if (existingCategory) {
        const error: any = new Error(
          MESSAGES.ADMIN.ERROR.NO_DUPLICATE_CATEGORY
        );
        error.code = "DUPLICATE_NAME";
        throw error;
      }

      return await this.categoryRepository.create(data);
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
        throw new Error(MESSAGES.ADMIN.ERROR.INVALID_CATEGORY);
      }

      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        const error: any = new Error(MESSAGES.ADMIN.ERROR.NO_CATEGORY);
        error.code = "NOT_FOUND";
        throw error;
      }

      if (existingCategory.name !== data.name) {
        const nameExists = await this.categoryRepository.findByName(data.name);
        if (nameExists) {
          const error: any = new Error(
            MESSAGES.ADMIN.ERROR.NO_DUPLICATE_CATEGORY
          );
          error.code = "DUPLICATE_NAME";
          throw error;
        }
      }

      return await this.categoryRepository.update(id, data);
    } catch (error) {
      console.error("Error in CategoryService.updateCategory:", error);
      throw error;
    }
  }
}

//export default new CategoryService();
