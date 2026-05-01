import { useEffect, useRef } from 'react';

interface UsePollingTimeoutOptions {
  /** Should the timer be running? (e.g., currentStep === 'processing') */
  isRunning: boolean;
  /** Has the polling succeeded? (e.g., !!data?.is_analyzed) */
  isSuccessful: boolean;
  /** Duration in ms before triggering timeout (default: 60000) */
  timeoutMs?: number;
  /** Function to call when time runs out */
  onTimeout: () => void;
  /** Optional: Unique key to force timer reset (e.g., activationId) */
  resetKey?: string | number | null;
}

export const usePollingTimeout = ({
  isRunning,
  isSuccessful,
  timeoutMs = 60000,
  onTimeout,
  resetKey,
}: UsePollingTimeoutOptions) => {
  // Use a ref for the callback to prevent the effect from re-running
  // unnecessarily if the function identity changes
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    // 1. If we shouldn't be running or have already succeeded, do nothing.
    // The cleanup function will handle clearing any existing timers.
    if (!isRunning || isSuccessful) return;

    // 2. Start the timer
    const timerId = setTimeout(() => {
      // Check references inside to be double safe
      onTimeoutRef.current();
    }, timeoutMs);

    // 3. Cleanup on unmount, success, or when isRunning becomes false
    return () => clearTimeout(timerId);
  }, [isRunning, isSuccessful, timeoutMs, resetKey]);
};