import { Request, Response } from "express";
import { IHostProfileController } from "./interfaces/IHostProfileController";
import HostProfileService from "../services/hostProfileService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class HostProfileController implements IHostProfileController {
  
  async getHostProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostId = req.user?.userId;
      if (!hostId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      const profile = await HostProfileService.getHostProfile(hostId);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: "Host profile retrieved successfully",
        hostProfile: profile,
      });
    } catch (error) {
      console.error("Get Host Profile Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async updateHostProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostId = req.user?.userId;
      if (!hostId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      console.log(req.body)
      const result = await HostProfileService.updateHostProfile(hostId, req.body as unknown as FormData);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Update Host Profile Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new HostProfileController();
