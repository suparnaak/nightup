import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IHost } from '../models/host';
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IHostService } from './interfaces/IHostService';
import { sendOtpEmail } from '../utils/mailer';
import { generateOTP } from '../utils/otpGenerator';
import { MESSAGES } from '../utils/constants';
import { HostSignupDTO, HostLoginDTO, HostAuthResponseDTO, OtpResponseDTO } from '../dtos/host/HostDTO';
import { HostMapper } from '../mappers/HostMapper';

@injectable()
export class HostService implements IHostService {
  constructor(
    @inject(TYPES.HostRepository) private hostRepository: IHostRepository
  ) {}

}
