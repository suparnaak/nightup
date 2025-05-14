import { IEventTypeDocument } from "../../models/eventTypes";

export interface ICategoryService {
   //getAllCategories(): Promise<IEventTypeDocument[]>
    getAllCategories(page?: number, limit?: number): Promise<{
    categories: IEventTypeDocument[],
    pagination: {
      total: number,
      page: number,
      totalPages: number,
      limit: number
    }
  }>;
   createCategory(data: { name: string; description: string }): Promise<IEventTypeDocument>
   updateCategory(
    id: string,
    data: { name: string; description: string }
  ): Promise<IEventTypeDocument | null>
}