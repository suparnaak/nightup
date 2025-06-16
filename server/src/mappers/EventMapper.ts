/* import { Types } from 'mongoose';
import { IEventDocument } from '../models/events';
import {
  CreateEventDto,
  EventResponseDto,
  TicketDto,
  LocationDto,
  UpdateEventDto,
} from '../dtos/event/EventDTO';


export class EventMapper {

  static toPersistence(dto: CreateEventDto): Partial<IEventDocument> {
    return {
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
      tickets: dto.tickets.map((t: TicketDto) => ({
        ticketType: t.ticketType,
        ticketPrice: t.ticketPrice,
        ticketCount: t.ticketCount,
      })),
      eventImage: dto.eventImage || '',
      additionalDetails: dto.additionalDetails,
      isBlocked: dto.isBlocked ?? false,
      location: dto.location as LocationDto,
    };
  }

 
  static toUpdatePersistence(dto: UpdateEventDto): Partial<IEventDocument> {
    const updateData: Partial<IEventDocument> = {};

    // Only include fields that are actually provided in the DTO
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
    if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.hostId !== undefined) updateData.hostId = new Types.ObjectId(dto.hostId);
    if (dto.venueName !== undefined) updateData.venueName = dto.venueName;
    if (dto.venueCity !== undefined) updateData.venueCity = dto.venueCity;
    if (dto.venueState !== undefined) updateData.venueState = dto.venueState;
    if (dto.venueZip !== undefined) updateData.venueZip = dto.venueZip;
    if (dto.venueCapacity !== undefined) updateData.venueCapacity = dto.venueCapacity;
    if (dto.categoryId !== undefined) updateData.categoryId = new Types.ObjectId(dto.categoryId);
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.artist !== undefined) updateData.artist = dto.artist;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.tickets !== undefined) {
      updateData.tickets = dto.tickets.map((t: TicketDto) => ({
        ticketType: t.ticketType,
        ticketPrice: t.ticketPrice,
        ticketCount: t.ticketCount,
      }));
    }
    if (dto.eventImage !== undefined) updateData.eventImage = dto.eventImage;
    if (dto.additionalDetails !== undefined) updateData.additionalDetails = dto.additionalDetails;
    if (dto.isBlocked !== undefined) updateData.isBlocked = dto.isBlocked;
    if (dto.location !== undefined) updateData.location = dto.location as LocationDto;

    return updateData;
  }

  static toResponse(doc: IEventDocument): EventResponseDto {
    return {
      _id: doc._id.toHexString(),
      title: doc.title,
      startTime: doc.startTime,
      endTime: doc.endTime,
      date: doc.date,
      hostId: doc.hostId.toHexString(),
      
      venueName: doc.venueName,
      venueCity: doc.venueCity,
      venueState: doc.venueState,
      venueZip: doc.venueZip,
      venueCapacity: doc.venueCapacity,
      categoryId: doc.categoryId.toString(),
      category: doc.category,
      artist: doc.artist,
      description: doc.description,
      tickets: doc.tickets.map(t => ({
        ticketType: t.ticketType,
        ticketPrice: t.ticketPrice,
        ticketCount: t.ticketCount,
      })),
      eventImage: doc.eventImage,
      additionalDetails: doc.additionalDetails,
      isBlocked: doc.isBlocked,
      cancellationReason: doc.cancellationReason,
      location: doc.location as LocationDto,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  
  static toResponseArray(docs: IEventDocument[]): EventResponseDto[] {
    return docs.map(d => this.toResponse(d));
  }
} */
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