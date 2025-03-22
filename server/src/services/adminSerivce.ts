import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAdmin } from '../models/admin';
import { MESSAGES } from "../utils/constants";
import { IAdminService } from './interfaces/IAdminService';
import AdminRepository from '../repositories/adminRepository';

class AdminService implements IAdminService {

    async login(email: string, password: string): Promise<{
        success: boolean;message: string;token: string; refreshToken: string; admin: Partial<IAdmin>; }> {
        const admin = await AdminRepository.findByEmail(email);
      
        if (!admin) {
          return {
            success: false,
            message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS || "Invalid email or password",
            token: "",
            refreshToken: "",
            admin: {},
          };
        }
      
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
          return {
            success: false,
            message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS || "Invalid email or password",
            token: "",
            refreshToken: "",
            admin: {},
          };
        }
      
        const jwtSecret = process.env.JWT_SECRET;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; 
      
        if (!jwtSecret || !jwtRefreshSecret) {
          return {
            success: false,
            message: MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING || "JWT secret missing",
            token: "",
            refreshToken: "",
            admin: {},
          };
        }
      
        // Access token (short-lived)
        const token = jwt.sign(
          { adminId: admin._id, type: "admin" },
          jwtSecret,
          { expiresIn: "1h" }
        );
      
        // Refresh token (longer-lived)
        const refreshToken = jwt.sign(
          { adminId: admin._id, type: "admin" },
          jwtRefreshSecret,
          { expiresIn: "7d" }
        );
      
        // Optionally store the refresh token in the DB
        await AdminRepository.updateRefreshToken(admin._id, refreshToken);
      
        return {
          success: true,
          message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
          token,
          refreshToken,
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: "admin"
          },
        };
    }
    async refreshToken(refreshToken: string): Promise<{ success: boolean; token: string; message: string; }> {
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || !jwtRefreshSecret) {
          throw new Error(MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING);
        }
    
        try {
          // Verify the refresh token
          const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as { adminId: string; type: string };
          
          // Optionally, check if the refresh token in the DB for the admin matches this one
    
          // Create a new access token
          const newAccessToken = jwt.sign(
            { adminId: decoded.adminId, type: "admin" },
            jwtSecret,
            { expiresIn: "1h" }
          );
    
          return {
            success: true,
            token: newAccessToken,
            message: "Access token refreshed successfully"
          };
        } catch (error) {
          throw new Error("Invalid refresh token");
        }
      }
}

export default new  AdminService();
