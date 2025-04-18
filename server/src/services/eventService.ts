import { Types } from 'mongoose';
import { IEventService, IEvent } from './interfaces/IEventService';
import EventRepository from '../repositories/eventRepository';
import HostRepository from '../repositories/hostRepository';
import HostSubscriptionRepository from '../repositories/hostSubscriptionRepository';
import BookingRepository from '../repositories/bookingRepository';
import { MESSAGES } from "../utils/constants";
import { IEventDocument } from '../models/events';


class EventService implements IEventService {

  async addEvent(eventData: IEvent): Promise<IEvent> {
    const host = await HostRepository.getHostProfile(eventData.hostId.toString());
    if (!host) {
      throw new Error("Host not found.");
    }
    if (!host.isVerified || host.isBlocked) {
      throw new Error(MESSAGES.HOST.ERROR.HOST_NOT_VERIFIED);
    }
    if (host.documentStatus !== "approved") {
      throw new Error(MESSAGES.HOST.ERROR.DOCUMENT_NOT_VERIFIED);
    }
    const hostSubscription = await HostSubscriptionRepository.getHostSubscription(eventData.hostId.toString());

      if (!hostSubscription || hostSubscription.status !== "Active" || new Date() > hostSubscription.endDate) {
        throw new Error(MESSAGES.HOST.ERROR.NO_SUBSCRIPTION);
      }
    return await EventRepository.addEvent(eventData);
  }

  async getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]> {
    return await EventRepository.getEventsByHostId(hostId);
  }

  async getAllEvents(query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string,
    city?: string
  }): Promise<{ events: IEvent[], total: number }> {
    return await EventRepository.getAllEvents(query);
  }
  
  async getEventsByCity(city: string, query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string
  }): Promise<{ events: IEvent[], total: number }> {
    
    return await EventRepository.getAllEvents({ ...query, city });
  }
  /* async getEventsByCity(city: string): Promise<IEvent[]> {
    return await EventRepository.getEventsByCity(city);
  } */
  async getEventDetails(eventId: Types.ObjectId): Promise<IEvent | null> {
    return await EventRepository.getEventById(eventId);
  }
  async editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null> {
    return await EventRepository.editEvent(eventId, eventData);
  }

  async deleteEvent(eventId: Types.ObjectId, reason: string): Promise<IEventDocument> {
    const updatedEvent = await EventRepository.blockEvent(eventId, reason);
    await BookingRepository.cancelAndRefundBookings(eventId, reason);
    if (!updatedEvent) throw new Error("Event not found");
    return updatedEvent;
  }
  async  getAllEventsForAdmin({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<{ events: IEvent[]; total: number }> {
    return await EventRepository.getEventsForAdmin(page, limit);
  }
  
}

export default new EventService();
