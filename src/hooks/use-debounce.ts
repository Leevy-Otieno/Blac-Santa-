import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const safeDelay = Math.max(0, delayMs);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, safeDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export default useDebounce;
