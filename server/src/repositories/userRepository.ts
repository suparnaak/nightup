import { Types } from "mongoose";
import User, { IUser } from "../models/user";
import { IUserRepository } from "./interfaces/IUserRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }
  
  async findById(userId: string): Promise<IUser | null> {
    return await super.findById(userId);
  }
  async updateUser(
    userId: string | Types.ObjectId,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await this.update(userId, updateData);
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
    const { items, total } = await this.findWithPagination({}, page, limit, { createdAt: -1 });
    return { users: items, total };
  }
}