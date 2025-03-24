import { Request, Response } from "express";
import { IAdminController } from "./interfaces/IAdminController";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import AdminService from "../services/adminSerivce";

class AdminController implements IAdminController {

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

      const result = await AdminService.login(email, password);

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
        return;
      }

      // Token cookie options
      const accessTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict',
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      };

      // Refresh token cookie options
      const refreshTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res
        // Set both access and refresh tokens as httpOnly cookies
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
      // Read the refresh token from cookies
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: "Refresh token not provided" });
        return;
      }

      // Call service to refresh the access token
      const result = await AdminService.refreshToken(refreshToken);

      // Set the new access token in cookie
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
        message: "Failed to refresh token",
      });
    }
  }
  //logout 
  async logout(req: Request, res: Response): Promise<void> {
 
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as 'strict'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGOUT
    });
  }
  //get all hosts
  async getHosts(req: Request, res: Response): Promise<void> {
    try {
      const hosts = await AdminService.getHosts();
      //console.log(hosts)
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: "Hosts retrieved successfully",
        hosts,
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
      const { hostId, action } = req.body;
      if (!hostId || !action) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const result = await AdminService.verifyDocument(hostId, action);
      
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
      const result = await AdminService.hostToggleStatus(hostId, newStatus);

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
      const users = await AdminService.getUsers();
      //console.log(hosts)
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: "Users retrieved successfully",
        users,
      });
    } catch (error) {
      console.error("Error fetching hosts:", error);
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
      const result = await AdminService.userToggleStatus(userId, newStatus);

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

export default new AdminController();
