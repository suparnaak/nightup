import { Types } from "mongoose";
import { IUser } from "../../models/user";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(userId: string): Promise<IUser | null>
  updateUser(userId: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null>
  getAllUsers(page: number, limit: number): Promise<{ users: IUser[], total: number }>
}
