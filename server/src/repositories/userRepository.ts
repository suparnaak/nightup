import { Types } from "mongoose";
import User, { IUser } from "../models/user";
import { IUserRepository } from "./interfaces/IUserRepository";

class UserRepository implements IUserRepository {

   async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async createUser(user: IUser): Promise<IUser> {
    const newUser = new User(user);
    return await newUser.save();
  }

  async updateUser(userId: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

}

export default UserRepository;
