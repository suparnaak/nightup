import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { Types } from 'mongoose';
import { IEventService, IEvent } from './interfaces/IEventService';
import { IEventRepository } from '../repositories/interfaces/IEventRepository';
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IHostSubscriptionRepository } from '../repositories/interfaces/IHostSubscriptionRepository';
import { IBookingRepository } from '../repositories/interfaces/IBookingRepository';
import { MESSAGES } from "../utils/constants";
import { IEventDocument } from '../models/events';

@injectable()
export class EventService implements IEventService {

  constructor(
    @inject(TYPES.EventRepository)
    private eventRepository:IEventRepository,
    @inject(TYPES.HostRepository)
    private hostRepository:IHostRepository,
    @inject(TYPES.HostSubscriptionRepository)
    private hostSubscriptionRepository:IHostSubscriptionRepository,
    @inject(TYPES.BookingRepository)
    private bookingRepository: IBookingRepository
  ){}
  async addEvent(eventData: IEvent): Promise<IEvent> {
    const host = await this.hostRepository.getHostProfile(eventData.hostId.toString());
    if (!host) {
      throw new Error("Host not found.");
    }
    if (!host.isVerified || host.isBlocked) {
      throw new Error(MESSAGES.HOST.ERROR.HOST_NOT_VERIFIED);
    }
    if (host.documentStatus !== "approved") {
      throw new Error(MESSAGES.HOST.ERROR.DOCUMENT_NOT_VERIFIED);
    }
    const hostSubscription = await this.hostSubscriptionRepository.getHostSubscription(eventData.hostId.toString());

      if (!hostSubscription || hostSubscription.status !== "Active" || new Date() > hostSubscription.endDate) {
        throw new Error(MESSAGES.HOST.ERROR.NO_SUBSCRIPTION);
      }
    return await this.eventRepository.addEvent(eventData);
  }

  async getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]> {
    return await this.eventRepository.getEventsByHostId(hostId);
  }

  async getAllEvents(query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string,
    city?: string
  }): Promise<{ events: IEvent[], total: number }> {
    return await this.eventRepository.getAllEvents(query);
  }
  
  async getEventsByCity(city: string, query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string
  }): Promise<{ events: IEvent[], total: number }> {
    
    return await this.eventRepository.getAllEvents({ ...query, city });
  }
  /* async getEventsByCity(city: string): Promise<IEvent[]> {
    return await EventRepository.getEventsByCity(city);
  } */
  async getEventDetails(eventId: Types.ObjectId): Promise<IEvent | null> {
    return await this.eventRepository.getEventById(eventId);
  }
  async editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null> {
    return await this.eventRepository.editEvent(eventId, eventData);
  }

  async deleteEvent(eventId: Types.ObjectId, reason: string): Promise<IEventDocument> {
    const updatedEvent = await this.eventRepository.blockEvent(eventId, reason);
    await this.bookingRepository.cancelAndRefundBookings(eventId, reason);
    if (!updatedEvent) throw new Error(MESSAGES.COMMON.ERROR.NO_EVENT_FOUND);
    return updatedEvent;
  }
  async  getAllEventsForAdmin({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<{ events: IEvent[]; total: number }> {
    return await this.eventRepository.getEventsForAdmin(page, limit);
  }
  
}

//export default new EventService();
