import { BaseRepository } from "./baseRepository/baseRepository";
import Subscription, { ISubscription } from "../models/subscription";
import { IRevenueRepository } from "./interfaces/IRevenueRepository";

export class RevenueRepository extends BaseRepository<ISubscription> implements IRevenueRepository {
  constructor() {
    super(Subscription);
  }

  async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: "subscriptionplans",
          localField: "subscriptionPlan",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $ifNull: ["$proratedAmount", "$plan.price"] }
          }
        }
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getMonthlyRevenue(startDate: Date, endDate: Date): Promise<any[]> {
    const monthsDiff = 
      (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
      (endDate.getMonth() - startDate.getMonth());
    
    const monthlyRevenueData: { month: string, amount: number }[] = [];
    
    for (let i = 0; i <= monthsDiff; i++) {
      const date = new Date(endDate);
      date.setMonth(date.getMonth() - i);
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthlyRevenue = await Subscription.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $lookup: {
            from: "subscriptionplans", 
            localField: "subscriptionPlan",
            foreignField: "_id",
            as: "plan"
          }
        },
        {
          $unwind: "$plan"
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $ifNull: ["$proratedAmount", "$plan.price"] }
            }
          }
        }
      ]);
      
      const monthName = monthStart.toLocaleString('default', { month: 'short' });
      monthlyRevenueData.unshift({
        month: `${monthName} ${monthStart.getFullYear()}`,
        amount: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
      });
    }
    
    return monthlyRevenueData;
  }

  async getPlanRevenue(startDate: Date, endDate: Date): Promise<any[]> {
    const planRevenue = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: "subscriptionplans",
          localField: "subscriptionPlan",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
      {
        $group: {
          _id: "$plan.name",
          amount: {
            $sum: { $ifNull: ["$proratedAmount", "$plan.price"] }
          }
        }
      },
      {
        $project: {
          planName: "$_id",
          amount: 1,
          _id: 0
        }
      }
    ]);

    return planRevenue;
  }

  async getTransactionTypes(startDate: Date, endDate: Date): Promise<any[]> {
    const transactionTypes = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: "subscriptionplans",
          localField: "subscriptionPlan",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
      {
        $group: {
          _id: "$transactionType",
          count: { $sum: 1 },
          amount: {
            $sum: { $ifNull: ["$proratedAmount", "$plan.price"] }
          }
        }
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          amount: 1,
          _id: 0
        }
      }
    ]);

    const types = ["New", "Renewal", "Upgrade"];
    const result = types.map(type => {
      const found = transactionTypes.find(t => t.type === type);
      return found || { type, count: 0, amount: 0 };
    });

    return result;
  }

  async getRecentTransactions(): Promise<any[]> {
    const recentTransactions = await this.model.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("subscriptionPlan")
      .populate("host");
      
    return Promise.all(recentTransactions.map(async (sub: any) => {
      const host = sub.host;
      const plan = sub.subscriptionPlan;
      
      return {
        id: sub._id.toString(),
        hostName: host.name || "Unknown Host",
        planName: plan.name,
        amount: sub.proratedAmount || plan.price,
        date: sub.createdAt,
        type: sub.transactionType
      };
    }));
  }
}

export default RevenueRepository;