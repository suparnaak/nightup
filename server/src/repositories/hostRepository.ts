/* import { Types } from "mongoose";
import Host, { IHost } from "../models/host";
import { IHostRepository } from "./interfaces/IHostRepository";

export class HostRepository implements IHostRepository {
  async findByEmail(email: string): Promise<IHost | null> {
    return await Host.findOne({ email });
  }

  async createHost(host: IHost): Promise<IHost> {
    const newHost = new Host(host);
    return await newHost.save();
  }

  async updateHost(hostId: string | Types.ObjectId, updateData: Partial<IHost>): Promise<IHost | null> {
    return await Host.findByIdAndUpdate(hostId, updateData, { new: true });
  }

  async getHostProfile(hostId: string): Promise<IHost | null> {
    return await Host.findById(hostId);
  }

  async updateHostProfile(
    hostId: string,
    updateData: Record<string, any>
  ): Promise<IHost | null> {
    console.log("repository")
    console.log(updateData)
    return await this.updateHost(hostId, updateData);
  }

  //get all hosts

    async getAllHosts(page: number = 1, limit: number = 10): Promise<{ hosts: IHost[], total: number }> {
      const skip = (page - 1) * limit;
      const hosts = await Host.find().skip(skip).limit(limit).sort({ createdAt: -1 });
      const total = await Host.countDocuments();
      return { hosts, total };
    }
}

//export default new HostRepository();
 */
import { Types } from "mongoose";
import Host, { IHost } from "../models/host";
import Subscription from "../models/subscription";
import SubscriptionPlan from "../models/subscriptionPlan";
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

 /*  async getAllHosts(
    page: number = 1,
    limit: number = 10
  ): Promise<{ hosts: IHost[]; total: number }> {
    const { items: hosts, total } = await this.findWithPagination(
      {},
      page,
      limit,
      { createdAt: -1 }
    );
    console.log("host details at repository",hosts)
    return { hosts, total };
  } */
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
  console.log("hosts from repository", hosts)
  return { hosts, total };
}



}