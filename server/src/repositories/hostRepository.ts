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
}

export default HostRepository;
