import { IHost } from "../models/host";
import { HostDTO } from "../dtos/host/HostDTO";

export class HostMapper {
  static toDTO(host: IHost): HostDTO {
    return {
      id: host._id.toString(),
      name: host.name,
      email: host.email,
      phone: host.phone,
      hostType: host.hostType,
      isVerified: host.isVerified,
      isBlocked:host.isBlocked,
      role: 'host'
    };
  }

  static toDTOList(hosts: IHost[]): HostDTO[] {
    return hosts.map(h => this.toDTO(h));
  }
}
