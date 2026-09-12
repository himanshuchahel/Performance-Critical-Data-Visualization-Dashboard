import { useState, useCallback } from "react";

export function useSharedPerformance() {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [renderTime, setRenderTime] = useState(0);

  const updatePerformance = useCallback(
    (metrics: { fps: number; frameTime: number; renderTime: number }) => {
      setFps(Math.round(metrics.fps * 100) / 100);
      setFrameTime(Math.round(metrics.frameTime * 100) / 100);
      setRenderTime(Math.round(metrics.renderTime * 100) / 100);
    },
    []
  );

  return {
    fps,
    frameTime,
    renderTime,
    updatePerformance,
  };
}
