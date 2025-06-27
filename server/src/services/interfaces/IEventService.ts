import { CreateEventDto, UpdateEventDto, EventResponseDto } from '../../dtos/event/EventDTO';

export interface IEventService {
  addEvent(createEventDto: CreateEventDto): Promise<EventResponseDto>;
  getEventsByHostId(hostId: string): Promise<EventResponseDto[]>;
  getAllEvents(query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string,
    city?: string
  }): Promise<{ events: EventResponseDto[], total: number }>;
  getEventsByCity(city: string, query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string
  }): Promise<{ events: EventResponseDto[], total: number }>;
  getEventDetails(eventId: string): Promise<EventResponseDto | null>;
  editEvent(eventId: string, updateEventDto: UpdateEventDto): Promise<EventResponseDto | null>;
  deleteEvent(eventId: string, reason: string): Promise<EventResponseDto>;
  getAllEventsForAdmin({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<{ events: EventResponseDto[]; total: number }>;
}