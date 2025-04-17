import mongoose, { PipelineStage } from "mongoose";
import Booking from "../models/booking";
import Event from "../models/events"
import { IHostRevenueRepository } from "./interfaces/IHostRevenueRepository";

class HostRevenueRepository implements IHostRevenueRepository {
  async getHostTotalRevenue(hostId: string, startDate: Date, endDate: Date): Promise<number> {
    const pipeline = [
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: "$event"
      },
      {
        $match: {
          "event.hostId": new mongoose.Types.ObjectId(hostId),
          "paymentStatus": "paid",
          "status": "confirmed",
          "createdAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ] as PipelineStage[];

    const result = await Booking.aggregate(pipeline);
    return result.length > 0 ? result[0].totalRevenue : 0;
  }

  async getHostMonthlyRevenue(hostId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: "$event"
      },
      {
        $match: {
          "event.hostId": new mongoose.Types.ObjectId(hostId),
          "paymentStatus": "paid",
          "status": "confirmed",
          "createdAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          amount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $arrayElemAt: [["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], { $subtract: ["$_id.month", 1] }] },
              " ",
              { $toString: "$_id.year" }
            ]
          },
          amount: 1
        }
      }
    ] as PipelineStage[];

    return await Booking.aggregate(pipeline);
  }

  async getEventRevenue(hostId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: "$event"
      },
      {
        $match: {
          "event.hostId": new mongoose.Types.ObjectId(hostId),
          "paymentStatus": "paid",
          "status": "confirmed",
          "createdAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$eventId",
          eventName: { $first: "$event.title" },
          amount: { $sum: "$totalAmount" },
          ticketsSold: { $sum: { $sum: "$tickets.quantity" } }
        }
      },
      {
        $sort: { "amount": -1 }
      }
    ] as PipelineStage[];

    return await Booking.aggregate(pipeline);
  }

  async getPaymentMethodBreakdown(hostId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: "$event"
      },
      {
        $match: {
          "event.hostId": new mongoose.Types.ObjectId(hostId),
          "paymentStatus": "paid",
          "status": "confirmed",
          "createdAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
          amount: 1
        }
      }
    ];

    return await Booking.aggregate(pipeline);
  }

  async getCancellationAnalytics(hostId: string, startDate: Date, endDate: Date): Promise<any> {
    const pipeline = [
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: "$event"
      },
      {
        $match: {
          "event.hostId": new mongoose.Types.ObjectId(hostId),
          "status": "cancelled",
          "createdAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$cancellation.cancelledBy",
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          cancelledBy: "$_id",
          count: 1,
          amount: 1
        }
      }
    ];

    return await Booking.aggregate(pipeline);
  }

  async getTicketTypeBreakdown(hostId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: "$event"
      },
      {
        $match: {
          "event.hostId": new mongoose.Types.ObjectId(hostId),
          "paymentStatus": "paid",
          "status": "confirmed",
          "createdAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: "$tickets"
      },
      {
        $group: {
          _id: "$tickets.ticketType",
          quantity: { $sum: "$tickets.quantity" },
          revenue: { $sum: { $multiply: ["$tickets.price", "$tickets.quantity"] } }
        }
      },
      {
        $project: {
          _id: 0,
          ticketType: "$_id",
          quantity: 1,
          revenue: 1
        }
      }
    ];

    return await Booking.aggregate(pipeline);
  }
}

export default new HostRevenueRepository();