// repositories/reviewRepository.ts
import { Types } from "mongoose";
import  { IReviewDocument, Review } from "../models/review";

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
}

class ReviewRepository implements IReviewRepository {
  /** persist a new review */
  async create(data: {
    bookingId: Types.ObjectId;
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    rating: number;
    review: string;
  }): Promise<IReviewDocument> {
    const r = new Review(data);
    const savedReview = await r.save();
    return savedReview as IReviewDocument;  // 👈 cast here
  }
  

  /** one‐to‐one on booking */
  async findByBookingId(bookingId: string): Promise<IReviewDocument | null> {
    return await Review.findOne({ bookingId: new Types.ObjectId(bookingId) });
  }

  /** fetch all for an event */
  async findByEventId(eventId: string): Promise<IReviewDocument[]> {
    return await Review
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ createdAt: -1 });
  }
}

export default new ReviewRepository();
