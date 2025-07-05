import { Types } from "mongoose";
import Host, { IHost } from "../models/host";
import { IHostRepository } from "./interfaces/IHostRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class HostRepository
  extends BaseRepository<IHost>
  implements IHostRepository
{
  constructor() {
    super(Host);
  }

  async findByEmail(email: string): Promise<IHost | null> {
    return this.findOne({ email });
  }

  async createHost(host: IHost): Promise<IHost> {
    return this.create(host as any);
  }

  async updateHost(
    hostId: string | Types.ObjectId,
    updateData: Partial<IHost>
  ): Promise<IHost | null> {
    return this.update(hostId, updateData as any);
  }

  async getHostProfile(hostId: string): Promise<IHost | null> {
    return this.findById(hostId);
  }

  async updateHostProfile(
    hostId: string,
    updateData: Record<string, any>
  ): Promise<IHost | null> {
    return this.updateHost(hostId, updateData);
  }

  async getAllHosts(
  page: number = 1,
  limit: number = 10
): Promise<{ hosts: any[]; total: number }> {
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: {} },

    {
      $lookup: {
        from: "subscriptions",
        let: { hostId: "$_id" },
        pipeline: [
          { 
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$host", "$$hostId"] },
                  { $eq: ["$status", "Active"] }
                ]
              }
            }
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },

          {
            $lookup: {
              from: "subscriptionplans",
              let: { planId: "$subscriptionPlan" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$planId"] } } },
                { $limit: 1 }
              ],
              as: "plan"
            }
          },
          { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } }
        ],
        as: "currentSubscription"
      }
    },

    {
      $addFields: {
        hasActiveSubscription: { $gt: [{ $size: "$currentSubscription" }, 0] },
        subscriptionStatus: {
          $cond: [
            { $gt: [{ $size: "$currentSubscription" }, 0] },
            "Active",
            "Not Subscribed"
          ]
        },
        currentSubscription: {
          $arrayElemAt: ["$currentSubscription", 0]
        }
      }
    },

    { $sort: { createdAt: -1 } },
    {
      $facet: {
        hosts: [
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [{ $count: "count" }]
      }
    }
  ];

  const result = await Host.aggregate(pipeline).exec();
  const hosts  = result[0].hosts;
  const total  = result[0].totalCount[0]?.count || 0;
  return { hosts, total };
}



}