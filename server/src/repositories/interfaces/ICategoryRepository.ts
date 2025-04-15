import { IEventTypeDocument } from "../../models/eventTypes";

export interface ICategoryRepository {
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
