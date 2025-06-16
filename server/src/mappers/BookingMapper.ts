import { IBooking } from "../models/booking";
import {
  BookingDTO,
  DetailedBookingDTO,
  TicketDTO,
  CancellationDTO,
  GetBookingsResponseDTO,
  PaginationDTO,
  BookingSummaryDTO,
  EventBookingSummaryDTO,
} from "../dtos/booking/BookingDTO";

export class BookingMapper {
  private static extractId(field: any): string {
    if (!field) return "";

    if (typeof field === "object" && field._id) {
      return field._id.toString();
    }

    return field.toString();
  }

  private static constructVenue(event: any): string {
    if (!event) return "";
    
    if (event.venueName || event.venueCity || event.venueState) {
      const parts = [
        event.venueName || "",
        event.venueCity || "", 
        event.venueState || ""
      ].filter(part => part && part !== ""); 
      
      return parts.length > 0 ? parts.join(", ") : "";
    }
    
   
    return event.venue || "";
  }

  static toDTO(booking: IBooking): BookingDTO {
    return {
      id: booking._id.toString(),
      userId: this.extractId(booking.userId),
      eventId: this.extractId(booking.eventId),
      tickets: booking.tickets.map((ticket) => ({
        ticketType: ticket.ticketType,
        quantity: ticket.quantity,
        price: ticket.price,
      })),
      couponId: booking.couponId ? this.extractId(booking.couponId) : null,
      totalAmount: booking.totalAmount,
      discountedAmount: booking.discountedAmount,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      ticketNumber: booking.ticketNumber,
      cancellation: booking.cancellation && 
        (booking.cancellation.cancelledBy || booking.cancellation.cancelledAt)
        ? {
            cancelledBy: booking.cancellation.cancelledBy,
            cancelledAt: booking.cancellation.cancelledAt,
            reason: booking.cancellation.reason,
          }
        : undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  static toDTOArray(bookings: IBooking[]): BookingDTO[] {
    return bookings.map((booking) => this.toDTO(booking));
  }

  static toDetailedDTO(booking: any): DetailedBookingDTO {
    const baseDTO = this.toDTO(booking);

    return {
      ...baseDTO,
      user:
        booking.userId && typeof booking.userId === "object"
          ? {
              id: booking.userId._id.toString(),
              name: booking.userId.name,
              email: booking.userId.email,
            }
          : undefined,

      event:
        booking.eventId && typeof booking.eventId === "object"
          ? {
              id: booking.eventId._id.toString(),
              title: booking.eventId.title,
              date: booking.eventId.date,
              venue: this.constructVenue(booking.eventId),
            }
          : undefined,

      coupon:
        booking.couponId && typeof booking.couponId === "object"
          ? {
              id: booking.couponId._id.toString(),
              code: booking.couponId.code,
              discountValue: booking.couponId.discountValue,
              discountType: booking.couponId.discountType,
            }
          : undefined,
    };
  }

  static toGetBookingsResponse(
    bookings: IBooking[],
    total: number,
    pages: number,
    page: number,
    limit: number
  ): GetBookingsResponseDTO {
    return {
      success: true,
      bookings: this.toDTOArray(bookings),
      pagination: {
        total,
        pages,
        page,
        limit,
      },
    };
  }

  static toPaginationDTO(
    total: number,
    pages: number,
    page: number,
    limit: number
  ): PaginationDTO {
    return {
      total,
      pages,
      page,
      limit,
    };
  }

  static toBookingSummary(data: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    refundedAmount: number;
  }): BookingSummaryDTO {
    return {
      totalBookings: data.totalBookings,
      confirmedBookings: data.confirmedBookings,
      cancelledBookings: data.cancelledBookings,
      pendingBookings: data.pendingBookings,
      totalRevenue: data.totalRevenue,
      refundedAmount: data.refundedAmount,
    };
  }

  static toEventBookingSummary(data: {
    eventId: string;
    eventTitle: string;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    refundedAmount: number;
    ticketsSold: number;
    ticketsAvailable: number;
  }): EventBookingSummaryDTO {
    return {
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      totalBookings: data.totalBookings,
      confirmedBookings: data.confirmedBookings,
      cancelledBookings: data.cancelledBookings,
      pendingBookings: data.pendingBookings,
      totalRevenue: data.totalRevenue,
      refundedAmount: data.refundedAmount,
      ticketsSold: data.ticketsSold,
      ticketsAvailable: data.ticketsAvailable,
    };
  }

  static extractTicketTypes(bookings: IBooking[]): string[] {
    const ticketTypes = new Set<string>();
    bookings.forEach((booking) => {
      booking.tickets.forEach((ticket) => {
        ticketTypes.add(ticket.ticketType);
      });
    });
    return Array.from(ticketTypes);
  }

  static calculateTotalRevenue(bookings: IBooking[]): number {
    return bookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((total, booking) => total + booking.discountedAmount, 0);
  }

  static groupBookingsByStatus(
    bookings: IBooking[]
  ): Record<string, IBooking[]> {
    return bookings.reduce((groups, booking) => {
      const status = booking.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(booking);
      return groups;
    }, {} as Record<string, IBooking[]>);
  }

  static groupBookingsByPaymentMethod(
    bookings: IBooking[]
  ): Record<string, IBooking[]> {
    return bookings.reduce((groups, booking) => {
      const method = booking.paymentMethod;
      if (!groups[method]) {
        groups[method] = [];
      }
      groups[method].push(booking);
      return groups;
    }, {} as Record<string, IBooking[]>);
  }
}