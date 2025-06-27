import { injectable } from 'inversify';
import { Types } from 'mongoose';
import { IAuthRepository } from './interfaces/IAuthRepository';
import Admin, { IAdmin } from '../models/admin';
import Host, { IHost } from '../models/host';
import User, { IUser } from '../models/user';
import { BaseRepository } from './baseRepository/baseRepository';

type UserEntity = IAdmin | IHost | IUser;
type UserRole = 'admin' | 'host' | 'user';

@injectable()
export class AuthRepository implements IAuthRepository {
  private adminRepo: BaseRepository<IAdmin>;
  private hostRepo: BaseRepository<IHost>;
  private userRepo: BaseRepository<IUser>;

  constructor() {
    this.adminRepo = new BaseRepository(Admin);
    this.hostRepo = new BaseRepository(Host);
    this.userRepo = new BaseRepository(User);
    
  }

  async findByEmailAndRole(email: string, role: UserRole): Promise<UserEntity | null> {
    try {
      switch (role.toLowerCase()) {
        case 'admin':
          return await this.adminRepo.findOne({ email });
        
        case 'host':
          return await this.hostRepo.findOne({ email });
        
        case 'user':
          return await this.userRepo.findOne({ email });
        
        default:
          throw new Error(`Invalid role: ${role}`);
      }
    } catch (error) {
      console.error(`Error finding ${role} by email:`, error);
      return null;
    }
  }
async createUser(user: IUser): Promise<IUser> {
    return await this.userRepo.create(user);
  }

}