import { Types } from "mongoose";
import { IEventTypeDocument } from "../../models/eventTypes";
import { IBaseRepository } from "../baseRepository/IBaseRepository";

export interface ICategoryRepository extends IBaseRepository<IEventTypeDocument> {
  
  findAll(page?: number, limit?: number): Promise<{
    categories: IEventTypeDocument[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;

  findByName(name: string): Promise<IEventTypeDocument | null>;

  create(data: { name: string; description: string }): Promise<IEventTypeDocument>;

  update(
    id: string,
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument | null>;
}