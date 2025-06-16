/* 

export interface CreateEventDto {
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  hostId: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  categoryId: string;
  category: string;
  artist: string;
  description: string;
  tickets: TicketDto[];
  eventImage?: string;
  additionalDetails?: string;
  isBlocked?: boolean;
  location?: LocationDto;
}

export type UpdateEventDto = Partial<CreateEventDto>;

export interface LocationDto {
  type: 'Point';
  coordinates: [number, number];
}

export interface TicketDto {
  ticketType: string;
  ticketPrice: number;
  ticketCount: number;
}

export interface TicketResponseDto extends TicketDto {}

export interface EventResponseDto {
  _id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  hostId: string ;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  categoryId: string;
  category: string;
  artist: string;
  description: string;
  tickets: TicketResponseDto[];
  eventImage?: string;
  additionalDetails?: string;
  isBlocked: boolean;
  cancellationReason?: string;
  location?: LocationDto;
  createdAt: Date;
  updatedAt: Date;
} */
export interface CreateEventDto {
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  hostId: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  categoryId: string;
  category: string;
  artist: string;
  description: string;
  tickets: TicketDto[];
  eventImage?: string;
  additionalDetails?: string;
  isBlocked?: boolean;
  location?: LocationDto;
}

export type UpdateEventDto = Partial<CreateEventDto>;

export interface LocationDto {
  type: 'Point';
  coordinates: [number, number];
}

export interface TicketDto {
  ticketType: string;
  ticketPrice: number;
  ticketCount: number;
}

export interface HostDto {
  _id: string;
  name: string;
  email: string;
}

export interface EventResponseDto {
  _id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  hostId: string | HostDto; 
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  categoryId: string;
  category: string;
  artist: string;
  description: string;
  tickets: TicketDto[];
  eventImage?: string;
  additionalDetails?: string;
  isBlocked: boolean;
  cancellationReason?: string;
  location?: LocationDto;
  createdAt: Date;
  updatedAt: Date;
}
