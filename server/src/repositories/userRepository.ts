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
}

export default UserRepository;
