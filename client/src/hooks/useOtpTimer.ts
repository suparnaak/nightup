import { useState, useEffect, useCallback } from 'react';

interface UseOtpTimerReturn {
  timeLeft: number;       // Remaining time in seconds
  resetTimer: () => void; // Function to reset the timer to the initial duration
  isExpired: boolean;     // True if the timer has reached 0
}

/**
 * Custom hook to manage an OTP countdown timer.
 * @param initialTime - The initial countdown duration in seconds (default is 300 seconds = 5 minutes)
 * @returns timeLeft, a reset function, and an isExpired flag.
 */
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
