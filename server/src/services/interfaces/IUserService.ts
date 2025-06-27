import { IUser } from "../../models/user";


export interface IUserService {
    findUserByEmail(email: string): Promise<IUser | null>;
   }
