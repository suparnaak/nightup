import { useCallback } from "react";
declare global {
  interface Window {
    Razorpay: any;
  }
}
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
}
export const useRazorpay = () => {
  const openRazorpay = useCallback((options: RazorpayOptions) => {
    if (typeof window.Razorpay === "undefined") {
      console.error("Razorpay SDK is not loaded.");
      return;
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
  }, []);

  return { openRazorpay };
};
