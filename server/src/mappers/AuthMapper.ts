import { AuthResponseDTO } from "../dtos/auth/AuthDTO";
import { UserMapper }      from "./UserMapper";
import { IUser }           from "../models/user";
import { IHost }           from "../models/host";
import { IAdmin }          from "../models/admin";

type Entity = IUser | IHost | IAdmin;

interface ToAuthParams {
  success     : boolean;
  message     : string;
  role?       : "user" | "host" | "admin";
  entity?     : Entity;
  token?      : string;
  refreshToken?: string;
  otpRequired?: boolean;
  otpExpiry?  : Date;
}

export class AuthMapper {
  static toAuthResponse({
    success,
    message,
    role,
    entity,
    token,
    refreshToken,
    otpRequired,
    otpExpiry,
  }: ToAuthParams): AuthResponseDTO {
    let userDto;

    if (entity) {
      userDto = UserMapper.toDTO(entity as IUser);

      if (role) {
        userDto.role = role;
      }
    }

    return {
      success,
      message,
      token,
      refreshToken,
      otpRequired,
      otpExpiry,
      user: userDto,
    };
  }
}
