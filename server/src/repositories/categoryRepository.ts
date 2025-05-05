/* import { EventType, IEventTypeDocument } from "../models/eventTypes";
import { Types } from "mongoose";
//import { EventType,  } from "../models/eventTypes";
import { ICategoryRepository } from "./interfaces/ICategoryRepository";
import { MESSAGES } from "../utils/constants";
import { BaseRepository } from "./baseRepository/baseRepository";

export class CategoryRepository extends BaseRepository<IEventTypeDocument> implements ICategoryRepository  {
  constructor(){
    super(EventType)
  }
  
  async findAll(): Promise<IEventTypeDocument[]> {
    return EventType.find({}).sort({ name: 1 }).lean();
  }

  async findById(id: string): Promise<IEventTypeDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(MESSAGES.ADMIN.ERROR.NO_CATEGORY);
    }
    return EventType.findById(id).lean();
  }

 
  async findByName(name: string): Promise<IEventTypeDocument | null> {
    return EventType.findOne({ name }).lean();
  }

  async create(data: { name: string; description: string }): Promise<IEventTypeDocument> {
    const category = new EventType(data);
    return category.save();
  }

  async update(id: string, data: { name: string; description: string }): Promise<IEventTypeDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(MESSAGES.ADMIN.ERROR.NO_CATEGORY);
    }
    return EventType.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  
}

//export default new CategoryRepository(); */
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

  async findAll(): Promise<IEventTypeDocument[]> {
    return this.model.find({}).sort({ name: 1 }).lean();
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

  async create(
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument> {
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
