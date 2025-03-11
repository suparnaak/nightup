import { IUser } from "../../models/user";

export interface IUserService {
  signup(name: string, email: string, phone: string, password: string): Promise<IUser>;
}
