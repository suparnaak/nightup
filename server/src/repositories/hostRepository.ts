import { Types } from "mongoose";
import Host, { IHost } from "../models/host";
import { IHostRepository } from "./interfaces/IHostRepository";

class HostRepository implements IHostRepository {
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

  // New: updateHostProfile that accepts hostId and a plain object of update data
  async updateHostProfile(
    hostId: string,
    updateData: Record<string, any>
  ): Promise<IHost | null> {
    console.log("repository")
    console.log(updateData)
    return await this.updateHost(hostId, updateData);
  }

  //get all hosts
  async getAllHosts(): Promise<IHost[]> {
    return await Host.find();
  }
}

export default new HostRepository();
