import { IHost } from "../../models/host";

export interface IHostRepository {
  findByEmail(email: string): Promise<IHost | null>;
  createHost(host: IHost): Promise<IHost>;
  updateHost(hostId: string, updateData: Partial<IHost>): Promise<IHost | null>;
  updateHostProfile(hostId: string, updateData: Record<string, any>): Promise<IHost | null>;
  getHostProfile(hostId: string):  Promise<IHost | null>;
  getAllHosts(): Promise<IHost[]>;
}
