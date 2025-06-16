import { IUser } from '../models/user';
import { UserDTO } from '../dtos/user/UserDTO';

export class UserMapper {
  public static toDTO(user: IUser): UserDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      isBlocked:user.isBlocked,
      role: user.role || 'user'
    };
  }

  public static toDTOList(users: IUser[]): UserDTO[] {
    return users.map(user => this.toDTO(user));
  }

  public static toAuthResponse(
    success: boolean,
    message: string,
    token: string,
    refreshToken: string,
    user?: IUser,
    otpRequired?: boolean
  ) {
    return {
      success,
      message,
      token,
      refreshToken,
      otpRequired,
      user: user ? this.toDTO(user) : undefined
    };
  }
}