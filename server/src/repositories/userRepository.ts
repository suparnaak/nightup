/* import { Types } from "mongoose";
import User, { IUser } from "../models/user";
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }
  
  async findById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  async createUser(user: IUser): Promise<IUser> {
    const newUser = new User(user);
    return await newUser.save();
  }

  async updateUser(
    userId: string | Types.ObjectId,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

    async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
      const skip = (page - 1) * limit;
      const users = await User.find().skip(skip).limit(limit).sort({ createdAt: -1 });
      const total = await User.countDocuments();
      return { users, total };
    }
}

//export default new UserRepository();
 */
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

  async createUser(user: IUser): Promise<IUser> {
    return await this.create(user);
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