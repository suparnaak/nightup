import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import TYPES from "../config/di/types";
import { IUserService } from "../services/interfaces/IUserService";
import { IUserController } from "./interfaces/IUserController";

import { MESSAGES, STATUS_CODES, PASSWORD_RULES } from "../utils/constants";

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.UserService)
    private userService: IUserService
  ) {}

   async getProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.COMMON.ERROR.UNAUTHENTICATED });
      return;
    }
    res.status(STATUS_CODES.SUCCESS).json({ user: req.user });
  }

}
