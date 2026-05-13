import { useState, useEffect, useRef } from "react";

export function useCountdown(targetTime: Date | null): number {
  const [remaining, setRemaining] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!targetTime) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.floor((targetTime.getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff > 0) {
        raf.current = window.setTimeout(tick, 1000);
      }
    };
    tick();

    return () => clearTimeout(raf.current);
  }, [targetTime]);

  return remaining;
}
