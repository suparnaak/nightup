import { Types } from 'mongoose';
import { IEventDocument } from '../models/events';
import { CreateEventDto, EventResponseDto, HostDto, LocationDto, TicketDto, UpdateEventDto } from '../dtos/event/EventDTO';

export class EventMapper {

  static toPersistence(dto: CreateEventDto): Partial<IEventDocument> {
    const data: Partial<IEventDocument> = {
      title: dto.title,
      startTime: dto.startTime,
      endTime: dto.endTime,
      date: dto.date,
      hostId: new Types.ObjectId(dto.hostId),
      venueName: dto.venueName,
      venueCity: dto.venueCity,
      venueState: dto.venueState,
      venueZip: dto.venueZip,
      venueCapacity: dto.venueCapacity,
      categoryId: new Types.ObjectId(dto.categoryId),
      category: dto.category,
      artist: dto.artist,
      description: dto.description,
      tickets: dto.tickets.map((ticket) => ({
        ticketType: ticket.ticketType,
        ticketPrice: ticket.ticketPrice,
        ticketCount: ticket.ticketCount,
      })),
      eventImage: dto.eventImage || '',
      additionalDetails: dto.additionalDetails,
      isBlocked: dto.isBlocked ?? false,
    };

    if (dto.location) {
      data.location = {
        type: dto.location.type,
        coordinates: dto.location.coordinates,
      };
    }

    return data;
  }


  static toUpdatePersistence(dto: UpdateEventDto): Partial<IEventDocument> {
    const updateData: Partial<IEventDocument> = {};

    Object.keys(dto).forEach((key) => {
      const value = dto[key as keyof UpdateEventDto];
      if (value !== undefined) {
        switch (key) {
          case 'hostId':
            if (typeof value === 'string') {
              updateData.hostId = new Types.ObjectId(value);
            }
            break;
          case 'categoryId':
            if (typeof value === 'string') {
              updateData.categoryId = new Types.ObjectId(value);
            }
            break;
          case 'tickets':
            if (Array.isArray(value)) {
              updateData.tickets = value.map((t: TicketDto) => ({
                ticketType: t.ticketType,
                ticketPrice: t.ticketPrice,
                ticketCount: t.ticketCount,
              }));
            }
            break;
          case 'location':
            if (value && typeof value === 'object') {
              updateData.location = value as LocationDto;
            }
            break;
          default:
            (updateData as any)[key] = value;
        }
      }
    });

    return updateData;
  }

 
  static toResponse(doc: IEventDocument): EventResponseDto {
    let hostId: string | HostDto;
    if (typeof doc.hostId === 'object' && 'name' in doc.hostId) {
      hostId = {
        _id: doc.hostId._id.toString(),
        name: (doc.hostId as any).name,
        email: (doc.hostId as any).email,
      };
    } else {
      hostId = doc.hostId.toString();
    }

    return {
      _id: doc._id.toString(),
      title: doc.title,
      startTime: doc.startTime,
      endTime: doc.endTime,
      date: doc.date,
      hostId,
      venueName: doc.venueName,
      venueCity: doc.venueCity,
      venueState: doc.venueState,
      venueZip: doc.venueZip,
      venueCapacity: doc.venueCapacity,
      categoryId: doc.categoryId.toString(),
      category: doc.category,
      artist: doc.artist,
      description: doc.description,
      tickets: doc.tickets.map((ticket) => ({
        ticketType: ticket.ticketType,
        ticketPrice: ticket.ticketPrice,
        ticketCount: ticket.ticketCount,
      })),
      eventImage: doc.eventImage,
      additionalDetails: doc.additionalDetails,
      isBlocked: doc.isBlocked,
      cancellationReason: doc.cancellationReason,
      location: doc.location ? {
        type: doc.location.type,
        coordinates: doc.location.coordinates,
      } : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }


  static toResponseArray(docs: IEventDocument[]): EventResponseDto[] {
    return docs.map((doc) => this.toResponse(doc));
  }
}