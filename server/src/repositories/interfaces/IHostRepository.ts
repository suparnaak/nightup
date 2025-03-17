import { IHost } from "../../models/host";

export interface IHostRepository {
  findByEmail(email: string): Promise<IHost | null>;
  createHost(host: IHost): Promise<IHost>;
  updateHost(hostId: string, updateData: Partial<IHost>): Promise<IHost | null>;
}
