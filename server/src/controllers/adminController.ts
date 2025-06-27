import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import TYPES from "../config/di/types";
import { IAdminService } from "../services/interfaces/IAdminService";
import { IAdminController } from "./interfaces/IAdminController";
import {
  AdminLoginDTO,
  AdminAuthResponseDTO,
  VerifyDocumentRequestDTO,
  HostToggleStatusRequestDTO,
  UserToggleStatusRequestDTO,
} from "../dtos/admin/AdminDTO";
import { AdminMapper } from "../mappers/AdminMapper";

@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.AdminService)
    private adminService: IAdminService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as AdminLoginDTO;
      const { email, password } = dto;

      if (!email || !password) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result: AdminAuthResponseDTO = await this.adminService.login(dto);
      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
        return;
      }

      const accessOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 1000,
      };
      const refreshOpts = { ...accessOpts, maxAge: 7 * 24 * 60 * 60 * 1000 };

      res
        .cookie("token", result.token!, accessOpts)
        .cookie("refreshToken", result.refreshToken!, refreshOpts)
        .status(STATUS_CODES.SUCCESS)
        .json(result);
    } catch (err) {
      console.error("Admin Login Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({
            success: false,
            message: MESSAGES.COMMON.ERROR.REFRESH_TOKEN_MISSING,
          });
        return;
      }
      const result = await this.adminService.refreshToken(token);
      const opts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 1000,
      };
      res
        .cookie("token", result.token, opts)
        .status(STATUS_CODES.SUCCESS)
        .json(result);
    } catch (err) {
      console.error("Admin Refresh Error:", err);
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({
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
      //console.log("hosts:",hosts)
      const response = AdminMapper.toHostsResponseDTO(
        hosts,
        total,
        page,
        limit
      );
      console.log("response from controller", response.hosts);
      res.status(STATUS_CODES.SUCCESS).json(response);
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
      const dto = req.body as VerifyDocumentRequestDTO;
      const { hostId, action, rejectionReason } = dto;

      if (!hostId || !action) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result = await this.adminService.verifyDocument(
        hostId,
        action,
        rejectionReason
      );

      const response = AdminMapper.toVerifyDocumentResponseDTO(
        result.success,
        result.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR
      );

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(response);
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json(response);
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
      const dto = req.body as HostToggleStatusRequestDTO;
      const { hostId, newStatus } = dto;

      if (!hostId || newStatus === undefined) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result = await this.adminService.hostToggleStatus(
        hostId,
        newStatus
      );
      const response = AdminMapper.toHostToggleStatusResponseDTO(
        result.success,
        result.message
      );

      res.status(STATUS_CODES.SUCCESS).json(response);
    } catch (error) {
      console.error("Toggle Host Status Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  //to get all the users
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, total } = await this.adminService.getUsers(page, limit);

      const response = AdminMapper.toUsersResponseDTO(
        users,
        total,
        page,
        limit
      );
      res.status(STATUS_CODES.SUCCESS).json(response);
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
      const dto = req.body as UserToggleStatusRequestDTO;
      const { userId, newStatus } = dto;

      if (!userId || newStatus === undefined) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result = await this.adminService.userToggleStatus(
        userId,
        newStatus
      );
      const response = AdminMapper.toUserToggleStatusResponseDTO(
        result.success,
        result.message
      );

      res.status(STATUS_CODES.SUCCESS).json(response);
    } catch (error) {
      console.error("Toggle User Status Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

//export default new AdminController();
