
  import { Document, Types, FilterQuery } from "mongoose";

  export interface IBaseRepository<T extends Document> {
    findById(id: string | Types.ObjectId): Promise<T | null>;
    findOne(filter: FilterQuery<T>): Promise<T | null>;
    find(filter: FilterQuery<T>): Promise<T[]>;
    findWithPagination(
      filter?: FilterQuery<T>,
      page?: number,
      limit?: number,
      sort?: Record<string, 1 | -1>
    ): Promise<{ items: T[]; total: number; pages: number }>;
    create(data: Partial<T>): Promise<T>;
    update(id: string | Types.ObjectId, data: Partial<T>): Promise<T | null>;
    delete(id: string | Types.ObjectId): Promise<boolean>;
    count(filter: FilterQuery<T>): Promise<number>;
  }