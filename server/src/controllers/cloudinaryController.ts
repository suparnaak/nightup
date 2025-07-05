import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { MESSAGES, STATUS_CODES } from "../utils/constants";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class CloudinaryController {
  static generateSignature = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const timestamp = Math.round(new Date().getTime() / 1000);
      const upload_preset =
        process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default";

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          upload_preset: upload_preset,
        },
        process.env.CLOUDINARY_API_SECRET as string
      );

      res.status(STATUS_CODES.SUCCESS).json({
        signature,
        timestamp,
        cloudname: process.env.CLOUDINARY_CLOUD_NAME,
        apikey: process.env.CLOUDINARY_API_KEY,
        upload_preset,
      });
    } catch (error: any) {
      console.error("Error generating Cloudinary signature:", error);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: error.message || MESSAGES.HOST.ERROR.FAILED_CLOUDINARY_SIGNATURE });
    }
  };
}

export default CloudinaryController;
