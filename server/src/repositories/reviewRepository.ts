
import { Types } from "mongoose";
import { IReviewDocument, Review } from "../models/review";
import { IReviewRepository } from "./interfaces/IReviewRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class ReviewRepository extends BaseRepository<IReviewDocument> implements IReviewRepository {
  constructor() {
    super(Review);
  }
  
  async create(data: {
    bookingId: Types.ObjectId;
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    rating: number;
    review: string;
  }): Promise<IReviewDocument> {
    return await super.create(data);
  }

 
 async findByBookingId(bookingId: string): Promise<IReviewDocument | null> {
  if (!Types.ObjectId.isValid(bookingId)) {
    return null;
  }
  
  const objectId = new Types.ObjectId(bookingId);
  return await this.findOne({ bookingId: objectId });
}
  async findByEventId(eventId: string): Promise<IReviewDocument[]> {
    const reviews = await this.find({ eventId: new Types.ObjectId(eventId) });
   
    return reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findByHostId(hostId: string) {
    return this.model.aggregate([
      { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $match: { "event.hostId": new Types.ObjectId(hostId) } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      {
        $project: {
          bookingId: 1,
          eventId:    1,
          rating:     1,
          review:     1,
          createdAt:  1,
          "user._id":  1,
          "user.name": 1,
          "event.title": 1,   
        }
      },
      { $sort: { createdAt: -1 } }
    ]).exec();
  }
  

}