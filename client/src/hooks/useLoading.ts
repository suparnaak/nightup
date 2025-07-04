import { useState, useCallback } from "react";
const useLoading = (initialValue = false) => {
  const [loading, setLoading] = useState(initialValue);
  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
  };
};

export default useLoading;
