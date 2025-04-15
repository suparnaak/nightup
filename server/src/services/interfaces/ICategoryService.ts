import { IEventTypeDocument } from "../../models/eventTypes";

export interface ICategoryService {
   getAllCategories(): Promise<IEventTypeDocument[]>
   createCategory(data: { name: string; description: string }): Promise<IEventTypeDocument>
   updateCategory(
    id: string,
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument | null>
}