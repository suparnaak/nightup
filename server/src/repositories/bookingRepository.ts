import { Types } from "mongoose";
import Booking, { IBooking } from "../models/booking";
import { IBookingRepository } from "./interfaces/IBookingRepository";

class BookingRepository implements IBookingRepository {

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    const booking = new Booking(data);
    return await booking.save();
  }
  async findByUserId(userId: string): Promise<IBooking[]> {
    return await Booking.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate({
        path: "eventId",
        select: "title date venueName venueCity venueState eventImage"
      })
      .lean();
  }
  //cancellation
  async cancelBooking(
    bookingId: string, 
    userId: string, 
    cancellationDetails: { 
      cancelledBy: 'user' | 'host', 
      reason?: string 
    }
  ): Promise<IBooking | null> {
    return await Booking.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(bookingId), 
        userId: new Types.ObjectId(userId), 
        status: "confirmed" 
      },
      { 
        $set: { 
          status: "cancelled",
          cancellation: {
            cancelledBy: cancellationDetails.cancelledBy,
            cancelledAt: new Date(),
            reason: cancellationDetails.reason
          },
          paymentStatus: "refunded"
        } 
      },
      { new: true }
    );
  }
  
  // find booking by id
  async findById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(new Types.ObjectId(bookingId));
  }
  
  async getBookingsByEvent(eventId: string): Promise<IBooking[]> {
    return await Booking.find({ eventId: new Types.ObjectId(eventId) })
      .populate("userId", "name email")
      .populate("eventId", "title")
      .lean();
  }
  
}

export default new BookingRepository();
