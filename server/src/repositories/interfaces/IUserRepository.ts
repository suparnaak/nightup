import { Types } from "mongoose";
import { IUser } from "../../models/user";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(userId: string): Promise<IUser | null>
  createUser(user: IUser): Promise<IUser>;
  updateUser(userId: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null>
  //getAllUsers(): Promise<IUser[]>
  getAllUsers(page: number, limit: number): Promise<{ users: IUser[], total: number }>
}
