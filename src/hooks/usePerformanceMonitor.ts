import { useState, useEffect, useRef } from "react";

export function usePerfMonitor() {
  const [fps, setFps] = useState(0);
  const [averageFps, setAverageFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [renderTime, setRenderTime] = useState(0);

  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const countRef = useRef(0);

  const fpsHistoryRef = useRef<number[]>([]);

  // Keep number at 2 decimal places
  const roundToTwo = (value: number) =>
    Math.round(value * 100) / 100;

  useEffect(() => {
    lastRef.current = performance.now();

    const tick = (now: number) => {
      countRef.current++;

      const elapsed = now - lastRef.current;

      if (elapsed >= 1000) {
        // Actual FPS
        const measuredFps =
          (countRef.current * 1000) / elapsed;

        const safeFps = Math.min(
          Math.max(measuredFps, 0),
          240
        );

        const roundedFps = roundToTwo(safeFps);

        setFps(roundedFps);

        // Actual milliseconds per frame
        const measuredFrameTime =
          roundedFps > 0
            ? 1000 / roundedFps
            : 0;

        setFrameTime(
          roundToTwo(measuredFrameTime)
        );

        // Store last 30 FPS measurements
        fpsHistoryRef.current = [
          ...fpsHistoryRef.current,
          roundedFps,
        ].slice(-30);

        // Calculate average FPS
        const history = fpsHistoryRef.current;

        const avg =
          history.reduce(
            (sum, value) => sum + value,
            0
          ) / history.length;

        setAverageFps(roundToTwo(avg));

        countRef.current = 0;
        lastRef.current = now;
      }

      rafRef.current =
        requestAnimationFrame(tick);
    };

    rafRef.current =
      requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    fps,
    averageFps,
    frameTime,
    renderTime,
    setRenderTime,
  };
}