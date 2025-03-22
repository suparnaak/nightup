import { Types } from "mongoose";
import Admin, {IAdmin} from '../models/admin';
import { IAdminRepository } from "./interfaces/IAdminRepository";

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email });
  }
  async updateRefreshToken(adminId: string | Types.ObjectId, refreshToken: string): Promise<IAdmin | null> {
    return await Admin.findByIdAndUpdate(adminId, { refreshToken }, { new: true });
}
}
  export default new AdminRepository();
