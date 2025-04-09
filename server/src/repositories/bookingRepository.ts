import Booking, { IBooking } from "../models/booking";
import { IBookingRepository } from "./interfaces/IBookingRepository";

class BookingRepository implements IBookingRepository {
  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    const booking = new Booking(data);
    return await booking.save();
  }
}

export default new BookingRepository();
