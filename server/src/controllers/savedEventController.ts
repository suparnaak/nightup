import { Request, Response } from "express";
import SavedEventService from "../services/savedEventService";
import EventRepository from "../repositories/eventRepository";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { ISavedEventController } from "./interfaces/ISavedEventController";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class SavedEventController implements ISavedEventController {
  async getSavedEvents(req: AuthRequest, res: Response): Promise<void> {
   
      try {
        const userId = req.user?.userId;
        if (!userId) {
          res.status(STATUS_CODES.UNAUTHORIZED).json({
            success: false,
            message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
          });
          return;
        }
        const savedEvents = await SavedEventService.getSavedEvents(userId);
        console.log("saved events:-",savedEvents)
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          savedEvents,
        });
      } catch (error) {
        console.error("Get Saved Events Error:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
        });
      }
  }

  async saveEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { eventId } = req.body;
      console.log("event id",typeof(eventId))
      if (!eventId) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.USER.ERROR.EVENT_ID_MISSING,
        });
        return;
      }
      const isSaved = await SavedEventService.saveEvent(userId, eventId);
      if (!isSaved) {
        res.status(STATUS_CODES.CONFLICT).json({
          success: false,
          message: MESSAGES.USER.ERROR.EVENT_IS_SAVED,
        });
        return;
      }
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.USER.SUCCESS.EVENT_SAVED,
      });
    } catch (error) {
      console.error("Save Event Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async removeSavedEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { eventId } = req.params;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      if (!eventId) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.USER.ERROR.EVENT_ID_MISSING,
        });
        return;
      }
      const isRemoved = await SavedEventService.removeSavedEvent(userId, eventId);
      console.log("is removed controller",isRemoved)
      if (!isRemoved) {
        res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: MESSAGES.USER.ERROR.EVENT_ID_MISSING,
        });
        return;
      }
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.USER.SUCCESS.EVENT_REMOVED,
      });
    } catch (error) {
      console.error("Remove Saved Event Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new SavedEventController();
