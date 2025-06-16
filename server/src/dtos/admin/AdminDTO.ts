import { Types } from "mongoose";
import { BaseDTO } from "../base/BaseDTO";
import { HostDTO } from "../host/HostDTO";
import { UserDTO } from "../user/UserDTO";

export interface AdminDTO extends BaseDTO {
  id?: string | Types.ObjectId;
  name: string;
  email: string;
  role: 'admin';
}

// login
export interface AdminLoginDTO {
  email: string;
  password: string;
}

// auth
export interface AdminAuthResponseDTO {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  admin?: AdminDTO;
}

// host toggle
export interface HostToggleStatusRequestDTO {
  hostId: string;
  newStatus: boolean;
}

export interface HostToggleStatusResponseDTO {
  success: boolean;
  message: string;
}

// usr toggle
export interface UserToggleStatusRequestDTO {
  userId: string;
  newStatus: boolean;
}

export interface UserToggleStatusResponseDTO {
  success: boolean;
  message: string;
}

// document verification
export interface VerifyDocumentRequestDTO {
  hostId: string;
  action: "approve" | "reject";
  rejectionReason?: string;
}

export interface VerifyDocumentResponseDTO {
  success: boolean;
  message: string;
}

//pagination 
export interface PaginationMetaDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
//hosts with subscritption
export interface HostWithFields extends HostDTO {
  currentPlan?: {
    name: string;
    duration: string;
    price: number;
    startDate: Date;
    endDate:   Date;
    status:    "Active" | "Expired";
  };
  documentUrl:     string;
  documentStatus:  "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

// hosts response
export interface GetHostsResponseDTO {
  success: boolean;
  message: string;
  hosts: HostWithFields[];
  pagination: PaginationMetaDTO;
}

// users response
export interface GetUsersResponseDTO {
  success: boolean;
  message: string;
  users: UserDTO[];
  pagination: PaginationMetaDTO;
}
