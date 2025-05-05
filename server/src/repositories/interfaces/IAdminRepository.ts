import { Types } from "mongoose";
import { IAdmin } from "../../models/admin";
import { IBaseRepository } from "../baseRepository/IBaseRepository";

export interface IAdminRepository extends IBaseRepository<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>;
  updateRefreshToken(adminId: string | Types.ObjectId, refreshToken: string): Promise<IAdmin | null>;
}
