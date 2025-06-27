import { AdminAuthResponseDTO, AdminLoginDTO } from "../../dtos/admin/AdminDTO";
import { IAdmin } from "../../models/admin";
import { IHost } from "../../models/host";
import { IUser } from "../../models/user";

export interface IAdminService {
  login(dto: AdminLoginDTO): Promise<AdminAuthResponseDTO>;
  refreshToken(
    refreshToken: string
  ): Promise<{ token: string; message: string }>;
  getHosts(
    page: number,
    limit: number
  ): Promise<{ hosts: IHost[]; total: number }>;
  verifyDocument(
    hostId: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ): Promise<{ success: boolean; message: string }>;
  hostToggleStatus(
    hostId: string,
    newStatus: boolean
  ): Promise<{ success: boolean; message: string }>;
  userToggleStatus(
    userId: string,
    newStatus: boolean
  ): Promise<{ success: boolean; message: string }>;
  getUsers(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }>;
}
