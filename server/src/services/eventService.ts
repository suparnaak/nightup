import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { Types } from 'mongoose';
import { IEventService } from './interfaces/IEventService';
import { IEventRepository } from '../repositories/interfaces/IEventRepository';
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IHostSubscriptionRepository } from '../repositories/interfaces/IHostSubscriptionRepository';
import { IBookingRepository } from '../repositories/interfaces/IBookingRepository';
import { MESSAGES } from "../utils/constants";
import { CreateEventDto, UpdateEventDto, EventResponseDto } from '../dtos/event/EventDTO';
import { EventMapper } from '../mappers/EventMapper';
import { INotificationService } from './interfaces/INotificationService';
import { CreateNotificationDto } from '../dtos/notification/NotificationDTO';

@injectable()
export class EventService implements IEventService {
  constructor(
    @inject(TYPES.EventRepository)
    private eventRepository: IEventRepository,
    @inject(TYPES.HostRepository)
    private hostRepository: IHostRepository,
    @inject(TYPES.HostSubscriptionRepository)
    private hostSubscriptionRepository: IHostSubscriptionRepository,
    @inject(TYPES.BookingRepository)
    private bookingRepository: IBookingRepository,
    @inject(TYPES.NotificationService)
    private notificationService: INotificationService,
  ) {}

  async addEvent(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    const host = await this.hostRepository.getHostProfile(createEventDto.hostId);
    if (!host) {
      throw new Error(MESSAGES.COMMON.ERROR.NO_ACCOUNT);
    }
    if (!host.isVerified || host.isBlocked) {
      throw new Error(MESSAGES.HOST.ERROR.HOST_NOT_VERIFIED);
    }
    if (host.documentStatus !== "approved") {
      throw new Error(MESSAGES.HOST.ERROR.DOCUMENT_NOT_VERIFIED);
    }

    const hostSubscription = await this.hostSubscriptionRepository.getHostSubscription(createEventDto.hostId);
    if (!hostSubscription || hostSubscription.status !== "Active" || new Date() > hostSubscription.endDate) {
      throw new Error(MESSAGES.HOST.ERROR.NO_SUBSCRIPTION);
    }

    const eventData = EventMapper.toPersistence(createEventDto);
    
    const savedEvent = await this.eventRepository.addEvent(eventData);
    
    return EventMapper.toResponse(savedEvent);
  }


  async getEventsByHostId(hostId: string): Promise<EventResponseDto[]> {
    const hostObjectId = new Types.ObjectId(hostId);
    const events = await this.eventRepository.getEventsByHostId(hostObjectId);
    return EventMapper.toResponseArray(events);
  }

  async getAllEvents(query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string,
    city?: string
  }): Promise<{ events: EventResponseDto[], total: number }> {
    const result = await this.eventRepository.getAllEvents(query);
    return {
      events: EventMapper.toResponseArray(result.events),
      total: result.total
    };
  }

  async getEventsByCity(city: string, query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string
  }): Promise<{ events: EventResponseDto[], total: number }> {
    const result = await this.eventRepository.getAllEvents({ ...query, city });
    return {
      events: EventMapper.toResponseArray(result.events),
      total: result.total
    };
  }

  async getEventDetails(eventId: string): Promise<EventResponseDto | null> {
    
    const event = await this.eventRepository.findByIdPopulated(eventId);
    if (!event) return null;

    return EventMapper.toResponse(event);
  }

  //edit event
  async editEvent(eventId: string, updateEventDto: UpdateEventDto): Promise<EventResponseDto | null> {
   
    const eventObjectId = new Types.ObjectId(eventId);
    const updateData = EventMapper.toUpdatePersistence(updateEventDto);

    const updatedEvent = await this.eventRepository.editEvent(eventObjectId, updateData);
    if (!updatedEvent) {
      return null;
    }

    const userIds = await this.bookingRepository.findUserIdsByEvent(eventId);

    const notifications: CreateNotificationDto[] = userIds.map((uid) => ({
    user: uid.toString(),
    event: updatedEvent._id.toString(),
    message: MESSAGES.HOST.SUCCESS.EVENT_UPDATED(updatedEvent.title)

  }));

  await this.notificationService.notifyMultipleUsers(notifications);


    return EventMapper.toResponse(updatedEvent);
  }


 async deleteEvent(eventId: string, reason: string): Promise<EventResponseDto> {
  const eventObjectId = new Types.ObjectId(eventId);
  
  const event = await this.eventRepository.getEventById(eventObjectId);
  if (!event) {
    throw new Error(MESSAGES.COMMON.ERROR.NO_EVENT_FOUND);
  }

  const userIds = await this.bookingRepository.findUserIdsByEvent(eventId);
  
  const updatedEvent = await this.eventRepository.blockEvent(eventObjectId, reason);
  if (!updatedEvent) {
    throw new Error(MESSAGES.COMMON.ERROR.NO_EVENT_FOUND);
  }

  await this.bookingRepository.cancelAndRefundBookings(eventObjectId, reason);
  
  if (userIds.length > 0) {
    const notifications: CreateNotificationDto[] = userIds.map((uid) => ({
      user: uid.toString(),
      event: updatedEvent._id.toString(),
      message:MESSAGES.HOST.SUCCESS.EVENT_CANCELLED(event.title, reason)
    }));

    await this.notificationService.notifyMultipleUsers(notifications);
  }
  
  return EventMapper.toResponse(updatedEvent);
}

  async getAllEventsForAdmin({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<{ events: EventResponseDto[]; total: number }> {
    const result = await this.eventRepository.getEventsForAdmin(page, limit);
    return {
      events: EventMapper.toResponseArray(result.events),
      total: result.total
    };
  }
}