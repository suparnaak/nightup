import { Types } from "mongoose";
import { IBooking } from "../../models/booking";
import { IBaseRepository } from "../baseRepository/IBaseRepository";

export interface IBookingRepository extends IBaseRepository<IBooking> {
  createBooking(data: Partial<IBooking>): Promise<IBooking>;

  findByUserId(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{ bookings: IBooking[]; total: number; pages: number }>;

  cancelBooking(
    bookingId: string,
    userId: string,
    cancellationDetails: {
      cancelledBy: "user" | "host";
      reason?: string;
    }
  ): Promise<IBooking | null>;

  getBookingsByEvent(
    eventId: string,
    page?: number,
    limit?: number
  ): Promise<{ bookings: IBooking[]; total: number; pages: number }>;

  cancelAndRefundBookings(
    eventId: Types.ObjectId,
    reason: string
  ): Promise<void>;

  findUserIdsByEvent(eventId: string): Promise<Types.ObjectId[]>;
}