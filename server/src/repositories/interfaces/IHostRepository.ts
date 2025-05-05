/* import { Types } from "mongoose";
import { IHost } from "../../models/host";

export interface IHostRepository {
  findByEmail(email: string): Promise<IHost | null>;
  createHost(host: IHost): Promise<IHost>;
  updateHost(hostId: string | Types.ObjectId, updateData: Partial<IHost>): Promise<IHost | null>;
  updateHostProfile(hostId: string, updateData: Record<string, any>): Promise<IHost | null>;
  getHostProfile(hostId: string):  Promise<IHost | null>;
  //getAllHosts(): Promise<IHost[]>;
  getAllHosts(page: number, limit: number): Promise<{ hosts: IHost[], total: number }>
}
 */
import { Types } from "mongoose";
import { IHost } from "../../models/host";
import { IBaseRepository } from "../baseRepository/IBaseRepository";

export interface IHostRepository extends IBaseRepository<IHost> {
  findByEmail(email: string): Promise<IHost | null>;
  createHost(host: IHost): Promise<IHost>;
  updateHost(
    hostId: string | Types.ObjectId,
    updateData: Partial<IHost>
  ): Promise<IHost | null>;
  getHostProfile(hostId: string): Promise<IHost | null>;
  updateHostProfile(
    hostId: string,
    updateData: Record<string, any>
  ): Promise<IHost | null>;
  getAllHosts(
    page?: number,
    limit?: number
  ): Promise<{ hosts: IHost[]; total: number }>;
}