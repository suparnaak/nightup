 import axios from "axios";
import axiosHostClient from "../api/axiosHostClient";

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    const signatureResponse = await axiosHostClient.get('/cloudinary/signature');
    const { signature, timestamp, apikey, upload_preset, cloudname } = signatureResponse.data;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apikey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("upload_preset", upload_preset);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudname}/upload`;
    const uploadResponse = await axios.post(cloudinaryUrl, formData, {
      withCredentials: false,            
    });
    
    return uploadResponse.data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }

};