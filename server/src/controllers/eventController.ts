import { Request, Response } from "express";
import { Types } from "mongoose";
import { IEventController } from "./interfaces/IEventController";
import EventService from "../services/eventService";
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
      const event = await EventService.addEvent(eventData);

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
      const events = await EventService.getEventsByHostId(hostId);

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
      const { city } = req.query;
      let events: IEvent[];
      if (city && typeof city === "string" && city.trim() !== "") {
        events = await EventService.getEventsByCity(city);
        console.log(events)
      } else {
        events = await EventService.getAllEvents();
        
      }

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.HOST.SUCCESS.EVENT_FETCHED,
        events,
      });
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({ 
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR 
      });
    }
  }
  //get event's details
  async getEventDetails(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
   
      if (!eventId || !Types.ObjectId.isValid(eventId)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ 
          message: MESSAGES.COMMON.ERROR.INVALID_EVENT_ID 
        });
        return;
      }

      const event = await EventService.getEventDetails(new Types.ObjectId(eventId));

      if (!event) {
        res.status(STATUS_CODES.NOT_FOUND).json({ 
          message: MESSAGES.COMMON.ERROR.NO_EVENT_FOUND 
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

      const updatedEvent = await EventService.editEvent(new Types.ObjectId(eventId), req.body);
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

  // New method: Delete event
  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
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

      await EventService.deleteEvent(new Types.ObjectId(eventId));
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.HOST.SUCCESS.EVENT_DELETED,
      });
    } catch (error: any) {
      console.error("Error deleting event:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new EventController();
