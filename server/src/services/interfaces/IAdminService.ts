import { IAdmin } from "../../models/admin";

export interface IAdminService{
     login(email: string, password: string): Promise<{success: boolean;message: string;token: string;refreshToken: string;admin: Partial<IAdmin>; }>;
}