import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { IUser } from "../models/user";
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IUserService } from "./interfaces/IUserService";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository
  ){}

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }

 }
