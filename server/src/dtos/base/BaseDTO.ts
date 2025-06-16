import { Types } from "mongoose";

export interface BaseDTO {
  id?: string| Types.ObjectId;
}