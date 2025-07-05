import { injectable, inject } from "inversify";
import { Types } from "mongoose";
import TYPES from "../config/di/types";
import Booking, { IBooking } from "../models/booking";
import { IBookingRepository } from "./interfaces/IBookingRepository";
import { IWalletRepository } from "./interfaces/IWalletRepository";
import { BaseRepository } from "./baseRepository/baseRepository";
import { CANCEL_REFUND, CANCEL_REASON, MESSAGES, PLATFORM_FEE } from "../utils/constants";

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository
{
  constructor(
    @inject(TYPES.WalletRepository)
    private walletRepository: IWalletRepository
  ) {
    super(Booking);
  }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    const bookingData: Partial<IBooking> = {
      ...data,
      platformFee: PLATFORM_FEE,
    };
    const created = await this.create(bookingData);
    const populated = await this.model
      .findById(created._id)
      .populate({
        path: "eventId",
        select: "title date venueName venueCity venueState eventImage",
      })
      .lean();
    if (!populated) {
      throw new Error(MESSAGES.COMMON.ERROR.FAILED_TO_RETRIEVE);
    }
    return populated as IBooking;
  }

  async findById(bookingId: string): Promise<IBooking | null> {
    const doc = await super.findById(bookingId);
    if (!doc) return null;
    return (await this.model.populate(doc, {
      path: "eventId",
      select: "title date venueName venueCity venueState eventImage",
    })) as IBooking;
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ bookings: IBooking[]; total: number; pages: number }> {
    const filter = { userId: new Types.ObjectId(userId) };
    const { items, total, pages } = await this.findWithPagination(
      filter,
      page,
      limit,
      { createdAt: -1 }
    );
    const bookings = (await this.model.populate(items, {
      path: "eventId",
      select: "title date venueName venueCity venueState eventImage",
    })) as IBooking[];
    return { bookings, total, pages };
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    cancellationDetails: {
      cancelledBy: "user" | "host";
      reason?: string;
    }
  ): Promise<IBooking | null> {
    const updated = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(bookingId),
          userId: new Types.ObjectId(userId),
          status: "confirmed",
        },
        {
          $set: {
            status: "cancelled",
            cancellation: {
              cancelledBy: cancellationDetails.cancelledBy,
              cancelledAt: new Date(),
              reason: cancellationDetails.reason,
            },
            paymentStatus: "refunded",
          },
        },
        { new: true }
      )
      .lean();
    return (updated as IBooking) || null;
  }

  async getBookingsByEvent(
    eventId: string,
    page = 1,
    limit = 10
  ): Promise<{ bookings: IBooking[]; total: number; pages: number }> {
    const filter = { eventId: new Types.ObjectId(eventId) };
    const { items, total, pages } = await this.findWithPagination(
      filter,
      page,
      limit,
      { createdAt: -1 }
    );

    const bookings = (await this.model.populate(items, [
      { path: "userId", select: "name email" },
      {
        path: "eventId",
        select: "title date venueName venueCity venueState venue",
      },
      {
        path: "couponId",
        select: "code discountValue discountType",
      },
    ])) as IBooking[];

    return { bookings, total, pages };
  }
  async cancelAndRefundBookings(
    eventId: Types.ObjectId,
    reason: string
  ): Promise<void> {
    const confirmed = await this.find({ eventId, status: "confirmed" });
    for (const booking of confirmed) {
      await this.walletRepository.updateWalletBalance(
        booking.userId.toString(),
        booking.totalAmount,
        booking.paymentId,
        CANCEL_REFUND
      );
      booking.status = "cancelled";
      booking.paymentStatus = "refunded";
      booking.cancellation = {
        cancelledBy: "host",
        cancelledAt: new Date(),
        reason: `${CANCEL_REASON} ${reason}`,
      };
      await booking.save();
    }
  }
  async findUserIdsByEvent(eventId: string): Promise<Types.ObjectId[]> {
    const objectEventId = new Types.ObjectId(eventId);

    const ids = await this.model.distinct("userId", {
      eventId: objectEventId,
      status: "confirmed",
    });

    return ids.map((id) => new Types.ObjectId(String(id)));
  }
}
