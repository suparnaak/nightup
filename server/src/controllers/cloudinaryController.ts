import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

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
        res.status(401).json({ message: "Unauthorized" });
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

      res.status(200).json({
        signature,
        timestamp,
        cloudname: process.env.CLOUDINARY_CLOUD_NAME,
        apikey: process.env.CLOUDINARY_API_KEY,
        upload_preset,
      });
    } catch (error: any) {
      console.error("Error generating Cloudinary signature:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to generate signature" });
    }
  };
}

export default CloudinaryController;
