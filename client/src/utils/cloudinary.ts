import axios from "axios";

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
};