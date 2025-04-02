import { Types } from 'mongoose';
import { IEventService, IEvent } from './interfaces/IEventService';
import EventRepository from '../repositories/eventRepository';
import HostRepository from '../repositories/hostRepository';
import HostSubscriptionRepository from '../repositories/hostSubscriptionRepository';
import { MESSAGES } from "../utils/constants";


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

  async getAllEvents(): Promise<IEvent[]> {
    return await EventRepository.getAllEvents();
  }
  async getEventDetails(eventId: Types.ObjectId): Promise<IEvent | null> {
    return await EventRepository.getEventById(eventId);
  }
  async editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null> {
    return await EventRepository.editEvent(eventId, eventData);
  }

  // New service method: Delete event
  async deleteEvent(eventId: Types.ObjectId): Promise<void> {
    return await EventRepository.deleteEvent(eventId);
  }
}

export default new EventService();
