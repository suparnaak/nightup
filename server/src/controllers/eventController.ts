import { Request, Response } from "express";
import { Types } from "mongoose";
import { IEventController } from "./interfaces/IEventController";
import EventService from "../services/eventService";
import { IEvent } from "../services/interfaces/IEventService";
import { MESSAGES, STATUS_CODES } from "../utils/constants";


interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class EventController implements IEventController {
  //add an event
  async addEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostIdStr = req.user?.userId;
      if (!hostIdStr) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }

      const hostId = new Types.ObjectId(hostIdStr);
      console.log("Received event data:", req.body);

      const {
        title,
        startTime,
        endTime,
        date,
        venueName,
        venueCity,
        venueState,
        venueZip,
        venueCapacity,
        category,
        artist,
        description,
        tickets,
        eventImage,
        additionalDetails,
        isBlocked,
      } = req.body;

      if (
        !title ||
        !startTime ||
        !endTime ||
        !date ||
        !venueName ||
        !venueCity ||
        !venueState ||
        !venueZip ||
        !venueCapacity ||
        !category ||
        !artist ||
        !description ||
        !tickets
      ) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }

      const eventData: IEvent = {
        title,
        startTime: new Date(`${date}T${startTime}`),
        endTime: new Date(`${date}T${endTime}`),
        date: new Date(date),
        hostId,
        venueName,
        venueCity,
        venueState,
        venueZip,
        venueCapacity,
        category,
        artist,
        description,
        tickets,
        eventImage: eventImage || "",
        additionalDetails,
        isBlocked: isBlocked || false,
      };

      const event = await EventService.addEvent(eventData);

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: "Event created successfully.",
        event,
      });
    } catch (error: any) {
      console.error("Error creating event:", error);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR });
    }
  }

  //get events - host specific
  async getEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostIdStr = req.user?.userId;
      if (!hostIdStr) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }

      const hostId = new Types.ObjectId(hostIdStr);
      const events = await EventService.getEventsByHostId(hostId);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: "Events fetched successfully.",
        events,
      });
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR });
    }
  }

  // get all events not host specific
  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await EventService.getAllEvents();

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: "Events fetched successfully.",
        events,
      });
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR });
    }
  }
}

export default new EventController();
