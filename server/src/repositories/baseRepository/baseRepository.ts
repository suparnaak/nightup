/* import { Document, Model, Types, FilterQuery, UpdateQuery } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filter);
  }

  async findWithPagination(
    filter: FilterQuery<T> = {}, 
    page: number = 1, 
    limit: number = 10, 
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<{ items: T[], total: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter)
    ]);
    
    const pages = Math.ceil(total / limit);
    
    return { items, total, pages };
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string | Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }
} */

  import { Document, Model, Types, FilterQuery } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filter);
  }

  async findWithPagination(
    filter: FilterQuery<T> = {},
    page: number = 1,
    limit: number = 10,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<{ items: T[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter)
    ]);
    const pages = Math.ceil(total / limit);
    return { items, total, pages };
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string | Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }
}
