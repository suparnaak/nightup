import { Types } from "mongoose";
import { IReviewDocument } from "../../models/review";

export interface IReviewRepository {
  create(data: {
    bookingId: Types.ObjectId;
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    rating: number;
    review: string;
  }): Promise<IReviewDocument>;
  findByBookingId(bookingId: string): Promise<IReviewDocument | null>;
  findByEventId(eventId: string): Promise<IReviewDocument[]>;
  findByHostId(
    hostId: string
  ): Promise<
    Array<{
      _id: Types.ObjectId;
      bookingId: Types.ObjectId;
      eventId: Types.ObjectId;
      rating: number;
      review: string;
      createdAt: Date;
      user: { _id: Types.ObjectId; name: string };
      event: { title: string };           
    }>
  >;
}