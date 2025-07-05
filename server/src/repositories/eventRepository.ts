import { Types } from "mongoose";
import { injectable } from "inversify";
import Event, { IEventDocument } from "../models/events";
import Booking from "../models/booking";
import { IEventRepository } from "./interfaces/IEventRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

@injectable()
export class EventRepository
  extends BaseRepository<IEventDocument>
  implements IEventRepository
{
  constructor() {
    super(Event);
  }

  async addEvent(eventData: Partial<IEventDocument>): Promise<IEventDocument> {
    return super.create(eventData as any);
  }

  async getEventsByHostId(hostId: Types.ObjectId): Promise<IEventDocument[]> {
    return this.model.find({ hostId }).sort({ date: -1 }) as Promise<
      IEventDocument[]
    >;
  }

  async getAllEvents(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    date?: string;
    city?: string;
  }): Promise<{ events: IEventDocument[]; total: number }> {
    const { page = 1, limit = 2, search, category, date, city } = query;
    const skip = (page - 1) * limit;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filter: any = {
      isBlocked: false,
      $or: [{ date: { $gt: today } }, { date: today, endTime: { $gte: now } }],
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
        { venueName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All Categories") filter.category = category;

    if (date) {
      const d = new Date(date);
      filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    if (city) filter.venueCity = city;

    const total = await this.count(filter);
    const events = await this.model
      .find(filter)
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return { events: events as IEventDocument[], total };
  }

  async getEventsByCity(city: string): Promise<IEventDocument[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return this.model
      .find({
        isBlocked: false,
        venueCity: { $regex: new RegExp(city, "i") },
        $or: [
          { date: { $gt: today } },
          { date: today, endTime: { $gte: now } },
        ],
      })
      .sort({ date: 1, startTime: 1 })
      .lean() as Promise<IEventDocument[]>;
  }

  async getEventById(eventId: Types.ObjectId): Promise<IEventDocument | null> {
    const doc = await this.model
      .findById(eventId)
      .populate("hostId", "name email")
      .lean<IEventDocument & { hostId: { _id: Types.ObjectId } }>();

    if (!doc) return null;

    doc.hostId = doc.hostId._id;
    return doc as IEventDocument;
  }

  async findByIdWithHost(eventId: string): Promise<IEventDocument | null> {
    try {
      const doc = await super.findById(eventId);
      if (!doc) return null;

      const populatedDoc = await this.model.populate(doc, {
        path: "hostId",
        select: "name email",
      });

      return populatedDoc;
    } catch (error) {
      console.error("Error finding event with host:", error);
      return null;
    }
  }
  async findByIdPopulated(eventId: string): Promise<IEventDocument | null> {
    try {
      const doc = await this.model
        .findById(eventId)
        .populate("hostId", "name email")
        .exec();

      return doc as IEventDocument;
    } catch (error) {
      console.error("Error finding populated event:", error);
      return null;
    }
  }

  async editEvent(
    eventId: Types.ObjectId,
    eventData: Partial<IEventDocument>
  ): Promise<IEventDocument | null> {
    return this.model
      .findByIdAndUpdate(eventId, eventData, { new: true })
      .lean() as Promise<IEventDocument | null>;
  }

  async blockEvent(
    eventId: Types.ObjectId,
    reason: string
  ): Promise<IEventDocument | null> {
    return this.model
      .findByIdAndUpdate(
        eventId,
        { isBlocked: true, cancellationReason: reason },
        { new: true }
      )
      .lean() as Promise<IEventDocument | null>;
  }

  async getEventsForAdmin(
    page: number,
    limit: number
  ): Promise<{ events: IEventDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.model
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .populate("hostId", "name")
        .lean(),
      this.count({}),
    ]);

    return { events: events as IEventDocument[], total };
  }
}
