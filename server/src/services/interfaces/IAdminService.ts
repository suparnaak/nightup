import { IAdmin } from "../../models/admin";
import { IHost } from "../../models/host";
import { IUser } from "../../models/user";

export interface IAdminService{
     login(email: string, password: string): Promise<{success: boolean;message: string;token: string;refreshToken: string;admin: Partial<IAdmin>; }>;
     refreshToken(refreshToken: string): Promise<{ token: string; message: string }>;
     getHosts(): Promise<IHost[]>;
     verifyDocument(hostId: string,
          action: "approve" | "reject",
          rejectionReason?: string): Promise<{ success: boolean; message: string }>
     hostToggleStatus(hostId: string, newStatus: boolean): Promise<{ success: boolean; message: string }>
     userToggleStatus(userId: string, newStatus: boolean): Promise<{ success: boolean; message: string }>
     getUsers(): Promise<IUser[]>

}