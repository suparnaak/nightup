export interface Ticket {
  _id?: string;
  ticketType: string;
  ticketPrice: number;
  ticketCount: number;
}

export interface Event {
  categoryId: string;
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  hostId:
    | {
        _id: string;
        name: string;
      }
    | string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  category: string;
  artist: string;
  description: string;
  tickets: Ticket[];
  eventImage: string;
  additionalDetails: string;
  isBlocked: boolean;
  cancellationReason?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; 
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface EventFilters {
  category?: string;
  date?: string;
  venueCity?: string;
}
  export interface SavedEvent {
    _id: string;
    user: string;
    event: {
      _id: string;
      title: string;
      eventImage?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      venueName?: string;
      venueCity?: string;
    };
  }