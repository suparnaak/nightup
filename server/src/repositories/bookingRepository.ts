import { Types } from "mongoose";
import Booking, { IBooking } from "../models/booking";
import { IBookingRepository } from "./interfaces/IBookingRepository";
import WalletRepository from "./walletRepository";

class BookingRepository implements IBookingRepository {
  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    const booking = new Booking(data);
    await booking.save();
    
    // Return populated booking to avoid issues in the client
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "eventId",
        select: "title date venueName venueCity venueState eventImage"
      })
      .lean();
      
    // TypeScript needs help to know this is not null
    if (!populatedBooking) {
      // This should never happen in practice since we just created the booking
      throw new Error("Failed to retrieve created booking");
    }
    
    return populatedBooking as IBooking;
  }
  
  async findById(bookingId: string): Promise<IBooking | null> {
    const booking = await Booking.findById(new Types.ObjectId(bookingId))
      .populate({
        path: "eventId",
        select: "title date venueName venueCity venueState eventImage"
      })
      .lean();
      
    return booking as IBooking | null;
  }
  
  async findByUserId(userId: string): Promise<IBooking[]> {
    const bookings = await Booking.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate({
        path: "eventId",
        select: "title date venueName venueCity venueState eventImage"
      })
      .lean();
      
    return bookings as IBooking[];
  }
  
  async cancelBooking(
    bookingId: string, 
    userId: string, 
    cancellationDetails: { 
      cancelledBy: 'user' | 'host', 
      reason?: string 
    }
  ): Promise<IBooking | null> {
    const cancelledBooking = await Booking.findOneAndUpdate(
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
    
    return cancelledBooking as IBooking | null;
  }
  
  async getBookingsByEvent(eventId: string): Promise<IBooking[]> {
    const bookings = await Booking.find({ eventId: new Types.ObjectId(eventId) })
      .populate("userId", "name email")
      .populate("eventId", "title")
      .lean();
      
    return bookings as IBooking[];
  }
  async cancelAndRefundBookings(eventId: Types.ObjectId, reason: string): Promise<void> {
    const bookings = await Booking.find({ eventId, status: "confirmed" });
  
    for (const booking of bookings) {
      await WalletRepository.updateWalletBalance(
        booking.userId.toString(),
        booking.discountedAmount,
        booking.paymentId,
        "Refund for event cancellation"
      );
  
      booking.status = "cancelled";
      booking.paymentStatus = "refunded";
      booking.cancellation = {
        cancelledBy: "host",
        cancelledAt: new Date(),
        reason: `Event cancelled: ${reason}`,
      };
  
      await booking.save();
    }
  }
  
  
}

export default new BookingRepository();