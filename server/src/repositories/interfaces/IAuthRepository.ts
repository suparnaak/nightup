import { Types } from "mongoose";
import { IAdmin } from "../../models/admin";
import { IHost } from "../../models/host";
import { IUser } from "../../models/user";

type UserEntity = IAdmin | IHost | IUser;
type UserRole = "admin" | "host" | "user";

export interface IAuthRepository {
  findByEmailAndRole(email: string, role: UserRole): Promise<UserEntity | null>;
  createUser(user: IUser): Promise<IUser>;
}
