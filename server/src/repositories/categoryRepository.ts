import { EventType, IEventTypeDocument } from "../models/eventTypes";
import { Types } from "mongoose";
//import { EventType,  } from "../models/eventTypes";
import { ICategoryRepository } from "./interfaces/ICategoryRepository";

class CategoryRepository implements ICategoryRepository  {
  
  async findAll(): Promise<IEventTypeDocument[]> {
    return EventType.find({}).sort({ name: 1 }).lean();
  }

  async findById(id: string): Promise<IEventTypeDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid category ID");
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
      throw new Error("Invalid category ID");
    }
    return EventType.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  
}

export default new CategoryRepository();