import { Types } from "mongoose";
import Admin, {IAdmin} from '../models/admin';
import { IAdminRepository } from "./interfaces/IAdminRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {
  constructor() {
    super(Admin);
  }
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await this.findOne({ email });
  }
  async updateRefreshToken(adminId: string | Types.ObjectId, refreshToken: string): Promise<IAdmin | null> {
    return await this.update(adminId, { refreshToken });
}
}
