import { useState, useEffect, useCallback } from "react";
interface UseOtpTimerReturn {
  timeLeft: number;
  resetTimer: (newTime?: number) => void;
  isExpired: boolean;
}

const useOtpTimer = (initialTime: number = 300): UseOtpTimerReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [origTime, setOrigTime] = useState<number>(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 1 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const resetTimer = useCallback(
    (newTime?: number) => {
      if (typeof newTime === "number") {
        setOrigTime(newTime);
        setTimeLeft(newTime);
      } else {
        setTimeLeft(origTime);
      }
    },
    [origTime]
  );

  return {
    timeLeft,
    resetTimer,
    isExpired: timeLeft === 0,
  };
};

export default useOtpTimer;
