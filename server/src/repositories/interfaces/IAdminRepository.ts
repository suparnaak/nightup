import { Types } from "mongoose";
import { IAdmin } from "../../models/admin";

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  updateRefreshToken(adminId: string | Types.ObjectId, refreshToken: string): Promise<IAdmin | null>;
}
