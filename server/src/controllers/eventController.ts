import 'reflect-metadata';
import { injectable,inject } from 'inversify';
import TYPES from '../config/di/types';
import { Request, Response } from "express";
import { Types } from "mongoose";
import { IEventController } from "./interfaces/IEventController";
import { IEventService } from '../services/interfaces/IEventService';
import { IEvent } from "../services/interfaces/IEventService";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import NodeGeocoder, { Options as GeocoderOptions } from "node-geocoder";

const geocoderOptions: GeocoderOptions = {
  provider: "openstreetmap",
};

const geocoder = NodeGeocoder(geocoderOptions);

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

@injectable()
export class EventController implements IEventController {
  constructor(
    @inject(TYPES.EventService)
    private eventService:IEventService

  ){}
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
        categoryId,
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
        !categoryId ||
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
        categoryId,
        category,
        artist,
        description,
        tickets,
        eventImage: eventImage || "",
        additionalDetails,
        isBlocked: isBlocked || false,
      };
      const fullAddress = `${venueZip}, ${venueCity}, ${venueState}`;
      const geoRes = await geocoder.geocode(fullAddress);
      if (geoRes && geoRes.length > 0) {
        const { latitude, longitude } = geoRes[0];
        eventData.location = {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        };
      } else {
        console.error("Geocoding failed for address:", fullAddress);
      }
      const event = await this.eventService.addEvent(eventData);

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.HOST.SUCCESS.EVENT_CREATED,
        event,
      });
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
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
      const events = await this.eventService.getEventsByHostId(hostId);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.HOST.SUCCESS.EVENT_FETCHED,
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
      const { city, page, limit, search, category, date } = req.query;

      const query = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 6,
        search: search as string,
        category: category as string,
        date: date as string,
      };

      let result;
      if (city && typeof city === "string" && city.trim() !== "") {
        result = await this.eventService.getEventsByCity(city, query);
      } else {
        result = await this.eventService.getAllEvents(query);
      }

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.HOST.SUCCESS.EVENT_FETCHED,
        events: result.events,
        pagination: {
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  //get event's details
  async getEventDetails(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId || !Types.ObjectId.isValid(eventId)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.COMMON.ERROR.INVALID_EVENT_ID,
        });
        return;
      }

      const event = await this.eventService.getEventDetails(
        new Types.ObjectId(eventId)
      );

      if (!event) {
        res.status(STATUS_CODES.NOT_FOUND).json({
          message: MESSAGES.COMMON.ERROR.NO_EVENT_FOUND,
        });
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS.EVENT_FETCHED,
        event,
      });
    } catch (error: any) {
      console.error("Error fetching event details:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  async editEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostIdStr = req.user?.userId;
      if (!hostIdStr) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }

      const { eventId } = req.params;
      if (!eventId || !Types.ObjectId.isValid(eventId)) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.INVALID_EVENT_ID });
        return;
      }

      const updatedEvent = await this.eventService.editEvent(
        new Types.ObjectId(eventId),
        req.body
      );
      if (!updatedEvent) {
        res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: MESSAGES.COMMON.ERROR.NO_EVENT_FOUND });
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.HOST.SUCCESS.EVENT_UPDATE,
        event: updatedEvent,
      });
    } catch (error: any) {
      console.error("Error updating event:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostIdStr = req.user?.userId;
      if (!hostIdStr) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const { eventId } = req.params;
      const { reason } = req.body;

      if (!eventId || !Types.ObjectId.isValid(eventId)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.COMMON.ERROR.INVALID_EVENT_ID,
        });
        return;
      }

      if (!reason || typeof reason !== "string") {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message: "Cancellation reason is required.",
        });
        return;
      }

      const updatedEvent = await this.eventService.deleteEvent(
        new Types.ObjectId(eventId),
        reason
      );
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        event: updatedEvent,
        message: MESSAGES.HOST.SUCCESS.EVENT_DELETED,
      });
    } catch (error: any) {
      console.error("Error deleting event:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  // admin side fetching all events
async getAllEventsForAdmin(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.eventService.getAllEventsForAdmin({ page, limit });
console.log("events for admin",result)
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.ADMIN.SUCCESS.EVENTS_FETCHED,
      events: result.events,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching events for admin:", error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
    });
  }
}

  
}

//export default new EventController();
