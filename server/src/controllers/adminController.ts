import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import TYPES from "../config/di/types";
import { IAdminService } from "../services/interfaces/IAdminService";
import { IAdminController } from "./interfaces/IAdminController";


@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.AdminService)
    private adminService: IAdminService
  ) {}
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result = await this.adminService.login(email, password);

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
        return;
      }
      const accessTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict',
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      };
      const refreshTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res
        .cookie('token', result.token, accessTokenCookieOptions)
        .cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions)
        .status(STATUS_CODES.SUCCESS)
        .json({
          success: true,
          message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
          admin: result.admin,
        });

    } catch (error) {
      console.error("Admin Login Error:", error);
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: errMessage,
      });
    }
  }
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: MESSAGES.COMMON.ERROR.REFRESH_TOKEN_MISSING });
        return;
      }
      const result = await this.adminService.refreshToken(refreshToken);

      const accessTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      };

      res
        .cookie('token', result.token, accessTokenCookieOptions)
        .status(STATUS_CODES.SUCCESS)
        .json({
          success: true,
          message: result.message,
          token: result.token,
        });
    } catch (error) {
      console.error("Refresh Token Error:", error);
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.REFRESH_TOKEN_INVALID,
      });
    }
  }

  //get all hosts
  
    async getHosts(req: Request, res: Response): Promise<void> {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const { hosts, total } = await this.adminService.getHosts(page, limit);
        console.log(hosts)
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message: MESSAGES.ADMIN.SUCCESS.HOSTS_FETCHED,
          hosts,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error("Error fetching hosts:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
        });
      }
    }
  //document verification
  async verifyDocument(req: Request, res: Response): Promise<void> {
    try {
      const { hostId, action, rejectionReason } = req.body;
      if (!hostId || !action) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      // Pass rejectionReason along (it will be ignored for approvals)
      const result = await this.adminService.verifyDocument(hostId, action, rejectionReason);
      
      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: result.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
        });
        return;
      }
      
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Verify Document Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  //block or unblock hosts
  async hostToggleStatus(req: Request, res: Response): Promise<void> {
    try {
      //console.log(req.body)
      const { hostId, newStatus } = req.body;
     // console.log(newStatus)
      if (!hostId || newStatus === undefined) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const result = await this.adminService.hostToggleStatus(hostId, newStatus);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Toggle Block Status Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

    async getUsers(req: Request, res: Response): Promise<void> {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const { users, total } = await this.adminService.getUsers(page, limit);
        
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message: MESSAGES.ADMIN.SUCCESS.USERS_FETCHED,
          users,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
        });
      }
    }
   //block or unblock users
   async userToggleStatus(req: Request, res: Response): Promise<void> {
    try {
      //console.log(req.body)
      const { userId, newStatus } = req.body;
     // console.log(newStatus)
      if (!userId || newStatus === undefined) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const result = await this.adminService.userToggleStatus(userId, newStatus);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Toggle Block Status Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

//export default new AdminController();
