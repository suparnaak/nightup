import { Types } from "mongoose";
import { EventType, IEventTypeDocument } from "../models/eventTypes";
import { ICategoryRepository } from "./interfaces/ICategoryRepository";
import { MESSAGES } from "../utils/constants";
import { BaseRepository } from "./baseRepository/baseRepository";

export class CategoryRepository
  extends BaseRepository<IEventTypeDocument>
  implements ICategoryRepository
{
  constructor() {
    super(EventType);
  }

  async findAll(
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
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      this.model.find().sort({ name: 1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(),
    ]);

    return {
      categories,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async findByName(name: string): Promise<IEventTypeDocument | null> {
    return this.model.findOne({ name }).lean();
  }

  async findById(id: string): Promise<IEventTypeDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(MESSAGES.ADMIN.ERROR.NO_CATEGORY);
    }
    return this.model.findById(id).lean();
  }

  async create(data: {
    name: string;
    description: string;
  }): Promise<IEventTypeDocument> {
    return super.create(data);
  }

  async update(
    id: string,
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(MESSAGES.ADMIN.ERROR.NO_CATEGORY);
    }
    return super.update(id, data);
  }
}
