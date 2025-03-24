import { Types } from 'mongoose';
import { IEventService, IEvent } from './interfaces/IEventService';
import EventRepository from '../repositories/eventRepository';
import HostRepository from '../repositories/hostRepository';

class EventService implements IEventService {

  async addEvent(eventData: IEvent): Promise<IEvent> {
    const host = await HostRepository.getHostProfile(eventData.hostId.toString());
    if (!host) {
      throw new Error("Host not found.");
    }
    if (!host.isVerified ||host.isBlocked) {
      throw new Error("You are not allowed to add an event. Your account status does not permit this action.");
    }
    if (!host.adminVerified) {
      throw new Error("You are not allowed to add an event. Your account is not verified by admin.");
    }
    if (host.subStatus !== "Active") {
      throw new Error("You are not allowed to add an event. Your don't have active Subscription Plan.");
    }
    return await EventRepository.addEvent(eventData);
  }

  async getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]> {
    return await EventRepository.getEventsByHostId(hostId);
  }

  async getAllEvents(): Promise<IEvent[]> {
    return await EventRepository.getAllEvents();
  }
  

}

export default new EventService();
