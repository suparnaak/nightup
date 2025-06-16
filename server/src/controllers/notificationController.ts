import "reflect-metadata";
import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { INotificationService } from "../services/interfaces/INotificationService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { INotificationController } from "./interfaces/INotificationController";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private notificationService: INotificationService
  ) {}

  /** GET /notifications */
  public async list(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
      return;
    }

    try {
      const notifications = await this.notificationService.listForUser(userId);
      res.status(STATUS_CODES.SUCCESS).json({ notifications });
    } catch (err: any) {
      console.error("Notification list error:", err);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: err.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR });
    }
  }

  /** GET /notifications/count */
  public async countUnread(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
      return;
    }

    try {
      const count = await this.notificationService.getUnreadCount(userId);
      res.status(STATUS_CODES.SUCCESS).json({ count });
    } catch (err: any) {
      console.error("Notification count error:", err);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: err.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR });
    }
  }

  /** PUT /notifications/:id/read */
  public async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.COMMON.ERROR.NOT_FOUND });
      return;
    }

    try {
      await this.notificationService.markRead(id);
      res
        .status(STATUS_CODES.SUCCESS)
        .json({ message: "Notification marked as read" });
    } catch (err: any) {
      console.error("Notification markAsRead error:", err);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: err.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR });
    }
  }
}
