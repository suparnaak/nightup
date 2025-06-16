import { useState, useEffect, useCallback } from "react";
interface UseOtpTimerReturn {
  timeLeft: number;
  resetTimer: () => void;
  isExpired: boolean;
}

const useOtpTimer = (initialTime: number = 300): UseOtpTimerReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 1 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  return {
    timeLeft,
    resetTimer,
    isExpired: timeLeft === 0,
  };
};

export default useOtpTimer;
