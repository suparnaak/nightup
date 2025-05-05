import { IReviewDocument } from "../../models/review";

export interface IReviewService {
  createReview(
    userId: string,
    bookingId: string,
    rating: number,
    reviewText: string
  ): Promise<IReviewDocument>;

  getReviewByBookingId(bookingId: string): Promise<IReviewDocument | null>;

  getReviewsByEvent(eventId: string): Promise<IReviewDocument[]>;

  getReviewsByHost(
    hostId: string
  ): Promise<
    Array<{
      _id: string;
      bookingId: string;
      eventId: string;
      eventTitle: string;                
      rating: number;
      review: string;
      createdAt: Date;
      user: { _id: string; name: string };
    }>
  >;
}