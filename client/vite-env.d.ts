/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
    readonly VITE_CLOUDINARY_CLOUD_NAME: string;
    readonly VITE_CLOUDINARY_UPLOAD_URL: string;
    readonly VITE_API_URL: string;
    readonly VITE_RAZORPAY_KEY_ID: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  // vite-env.d.ts or similar file
/* interface ImportMetaEnv {
  
} */