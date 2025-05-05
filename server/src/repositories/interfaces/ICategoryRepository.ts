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
  /** List all categories, sorted by name */
  findAll(): Promise<IEventTypeDocument[]>;

  /** Lookup a category by its unique name */
  findByName(name: string): Promise<IEventTypeDocument | null>;

  /**
   * Create a new category.
   * Override generic create to require name + description.
   */
  create(data: { name: string; description: string }): Promise<IEventTypeDocument>;

  /**
   * Update an existing category.
   * Override generic update to require name + description.
   */
  update(
    id: string,
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument | null>;
}