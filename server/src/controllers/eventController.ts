import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { IEventController } from "./interfaces/IEventController";
import { IEventService } from "../services/interfaces/IEventService";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import NodeGeocoder, { Options as GeocoderOptions } from "node-geocoder";
import { CreateEventDto, UpdateEventDto } from "../dtos/event/EventDTO";

const geocoderOptions: GeocoderOptions = {
  provider: "openstreetmap",
  timeout: 15000,
};

const geocoder = NodeGeocoder(geocoderOptions);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function safeGeocode(address: string): Promise<any> {
  try {
    await sleep(1000);
    const result = await geocoder.geocode(address);
    return result;
  } catch (error: any) {
    console.warn("Geocoding failed, retrying...", error.message);
    await sleep(3000);
    try {
      const result = await geocoder.geocode(address);
      return result;
    } catch (retryError) {
      console.error("Geocoding failed after retry:", retryError);
      return null;
    }
  }
}
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
    private eventService: IEventService
  ) {}

  // Add an event
  async addEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostIdStr = req.user?.userId;
      if (!hostIdStr) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
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

      const createEventDto: CreateEventDto = {
        title,
        startTime: new Date(`${date}T${startTime}`),
        endTime: new Date(`${date}T${endTime}`),
        date: new Date(date),
        hostId: hostIdStr,
        venueName,
        venueCity,
        venueState,
        venueZip,
        venueCapacity: Number(venueCapacity),
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
      const geoRes = await safeGeocode(fullAddress);

      if (geoRes && geoRes.length > 0) {
        const { latitude, longitude } = geoRes[0];
        createEventDto.location = {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        };
      } else {
        console.log("Geocoding failed, creating event without coordinates");
      }

      const eventResponseDto = await this.eventService.addEvent(createEventDto);

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.HOST.SUCCESS.EVENT_CREATED,
        event: eventResponseDto,
      });
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  // Get events - host specific
  async getEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostIdStr = req.user?.userId;
      if (!hostIdStr) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }

      const events = await this.eventService.getEventsByHostId(hostIdStr);

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

  // Get all events not host specific
  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const { city, page, limit, search, category, date } = req.query;

      const query = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 2,
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

  // Get event's details
  async getEventDetails(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId || !Types.ObjectId.isValid(eventId)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.COMMON.ERROR.INVALID_EVENT_ID,
        });
        return;
      }

      const event = await this.eventService.getEventDetails(eventId);
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
      console.error(MESSAGES.COMMON.ERROR.FAILED_TO_RETRIEVE, error);
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

      const updateEventDto: UpdateEventDto = { ...req.body };

      if (req.body.date) {
        const parsedDate = new Date(req.body.date);
        if (isNaN(parsedDate.valueOf())) {
          res
            .status(STATUS_CODES.BAD_REQUEST)
            .json({ message: MESSAGES.COMMON.ERROR.INVALID_DATE });
          return;
        }
        updateEventDto.date = parsedDate;
      }

      if (req.body.startTime) {
        const baseDate = updateEventDto.date ?? new Date();
        const isoDay = baseDate.toISOString().slice(0, 10);
        const parsedStart = new Date(`${isoDay}T${req.body.startTime}`);
        if (isNaN(parsedStart.valueOf())) {
          res
            .status(STATUS_CODES.BAD_REQUEST)
            .json({ message: MESSAGES.HOST.ERROR.INVALID_DATE });
          return;
        }
        updateEventDto.startTime = parsedStart;
        if (!req.body.date) {
          updateEventDto.date = new Date(isoDay);
        }
      }

      if (req.body.endTime) {
        const baseDate = updateEventDto.date ?? new Date();
        const isoDay = baseDate.toISOString().slice(0, 10);
        const parsedEnd = new Date(`${isoDay}T${req.body.endTime}`);
        if (isNaN(parsedEnd.valueOf())) {
          res
            .status(STATUS_CODES.BAD_REQUEST)
            .json({ message: MESSAGES.HOST.ERROR.INVALID_END_TIME});
          return;
        }
        updateEventDto.endTime = parsedEnd;
        if (!req.body.date) {
          updateEventDto.date = new Date(isoDay);
        }
      }

      if (
        updateEventDto.venueZip ||
        updateEventDto.venueCity ||
        updateEventDto.venueState
      ) {
        const fullAddress = `${updateEventDto.venueZip || ""}, ${
          updateEventDto.venueCity || ""
        }, ${updateEventDto.venueState || ""}`;
        const geoRes = await safeGeocode(fullAddress);

        if (geoRes && geoRes.length > 0) {
          const { latitude, longitude } = geoRes[0];
          updateEventDto.location = {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          };
        }
      }

      const updatedEvent = await this.eventService.editEvent(
        eventId,
        updateEventDto
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
          message: MESSAGES.HOST.ERROR.REQUIRED_CANCEL_REASON,
        });
        return;
      }

      const updatedEvent = await this.eventService.deleteEvent(eventId, reason);

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

  // Admin side fetching all events
  async getAllEventsForAdmin(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;

      const result = await this.eventService.getAllEventsForAdmin({
        page,
        limit,
      });
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
