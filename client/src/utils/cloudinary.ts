 import axios from "axios";
import axiosHostClient from "../api/axiosHostClient";
/*
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ""
  );

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured.");
  }

  const url = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
  const response = await axios.post(url, formData);
  return response.data.secure_url;
}; */

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    // Step 1: Get the signature from your backend
    const signatureResponse = await axiosHostClient.get('/cloudinary/signature');
    const { signature, timestamp, apikey, upload_preset, cloudname } = signatureResponse.data;

    // Step 2: Create FormData with required parameters for signed upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apikey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("upload_preset", upload_preset);

    // Step 3: Upload to Cloudinary with the signed request
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudname}/upload`;
    const uploadResponse = await axios.post(cloudinaryUrl, formData, {
      withCredentials: false,            // <— make sure cookies are _not_ sent
    });
    
    return uploadResponse.data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }

};