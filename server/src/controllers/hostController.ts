import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import TYPES from '../config/di/types';
import { IHostService } from '../services/interfaces/IHostService';
import { IHostController } from './interfaces/IHostController';
import { MESSAGES, STATUS_CODES } from '../utils/constants';
import { HostSignupDTO, HostLoginDTO, HostAuthResponseDTO, OtpResponseDTO } from '../dtos/host/HostDTO';
import { HostMapper } from '../mappers/HostMapper';

@injectable()
export class HostController implements IHostController {
  constructor(
    @inject(TYPES.HostService) private hostService: IHostService
  ) {}

  
}
