import { IBooking } from "../../models/booking";

export interface IBookingRepository {
  createBooking(data: Partial<IBooking>): Promise<IBooking>;
  findByUserId(userId: string): Promise<IBooking[]>;
  cancelBooking(
    bookingId: string,
    userId: string,
    cancellationDetails: {
      cancelledBy: "user" | "host";
      reason?: string;
    }
  ): Promise<IBooking | null>;
  findById(bookingId: string): Promise<IBooking | null>;
  getBookingsByEvent(eventId: string): Promise<IBooking[]>;
}
