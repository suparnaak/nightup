/* import { IEventTypeDocument } from "../../models/eventTypes";
import { IBaseRepository } from "../baseRepository/IBaseRepository";

export interface ICategoryRepository extends IBaseRepository<IEventTypeDocument> {
  findAll(): Promise<IEventTypeDocument[]>;
  findById(id: string): Promise<IEventTypeDocument | null>;
  findByName(name: string): Promise<IEventTypeDocument | null>;
  create(data: {
    name: string;
    description: string;
  }): Promise<IEventTypeDocument>;
  update(
    id: string,
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument | null>;
}
 */
import { Types } from "mongoose";
import { IEventTypeDocument } from "../../models/eventTypes";
import { IBaseRepository } from "../baseRepository/IBaseRepository";

export interface ICategoryRepository extends IBaseRepository<IEventTypeDocument> {
  
  //findAll(): Promise<IEventTypeDocument[]>;
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