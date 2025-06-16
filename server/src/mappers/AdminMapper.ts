import {
  AdminDTO,
  HostWithFields,
  GetHostsResponseDTO,
  GetUsersResponseDTO,
  HostToggleStatusResponseDTO,
  UserToggleStatusResponseDTO,
  VerifyDocumentResponseDTO
} from "../dtos/admin/AdminDTO";
import { HostDTO } from "../dtos/host/HostDTO";
import { UserDTO } from "../dtos/user/UserDTO";
import { IAdmin } from "../models/admin";
import { IHost } from "../models/host";
import { IUser } from "../models/user";
import { MESSAGES } from "../utils/constants";

export class AdminMapper {
  static toDTO(admin: IAdmin): AdminDTO {
    return {
      id:    admin._id,
      name:  admin.name,
      email: admin.email,
      role:  "admin",
    };
  }

  static toHostDTO(host: IHost): HostDTO {
    return {
      id:         host._id,
      name:       host.name,
      email:      host.email,
      phone:      host.phone || undefined,
      hostType:   host.hostType,
      isVerified: host.isVerified,
      isBlocked:  host.isBlocked,
      role:       "host",
    };
  }

 static toHostsResponseDTO(
  hosts: Array<IHost & { currentSubscription?: any }>,
  total: number,
  page: number,
  limit: number
): GetHostsResponseDTO {
  return {
    success: true,
    message: MESSAGES.ADMIN.SUCCESS.HOSTS_FETCHED,
    hosts: hosts.map(rawHost => {
      const base = this.toHostDTO(rawHost);

      const common: Partial<HostWithFields> = {
        documentUrl:     rawHost.documentUrl,
        documentStatus:  rawHost.documentStatus,
        rejectionReason: rawHost.rejectionReason,
      };

      const sub = rawHost.currentSubscription;
      if (sub && sub.plan) {
        return {
          ...base,
          ...common,
          currentPlan: {
            name:      sub.plan.name,
            duration:  sub.plan.duration,
            price:     sub.plan.price,
            startDate: sub.startDate,
            endDate:   sub.endDate,
            status:    sub.status,
          }
        } as HostWithFields;
      }

      return {
        ...base,
        ...common
      } as HostWithFields;
    }),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}


  static toUserDTO(user: IUser): UserDTO {
    return {
      id:         user._id.toString(),
      name:       user.name,
      email:      user.email,
      phone:      user.phone || undefined,
      isVerified: user.isVerified,
      isBlocked:  user.isBlocked,
      role:       "user",
    };
  }

  static toUsersResponseDTO(
    users: IUser[],
    total: number,
    page: number,
    limit: number
  ): GetUsersResponseDTO {
    return {
      success:  true,
      message:  MESSAGES.ADMIN.SUCCESS.USERS_FETCHED,
      users:    users.map(u => this.toUserDTO(u)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static toVerifyDocumentResponseDTO(
    success: boolean,
    message: string
  ): VerifyDocumentResponseDTO {
    return { success, message };
  }

  static toHostToggleStatusResponseDTO(
    success: boolean,
    message: string
  ): HostToggleStatusResponseDTO {
    return { success, message };
  }

  static toUserToggleStatusResponseDTO(
    success: boolean,
    message: string
  ): UserToggleStatusResponseDTO {
    return { success, message };
  }
}
