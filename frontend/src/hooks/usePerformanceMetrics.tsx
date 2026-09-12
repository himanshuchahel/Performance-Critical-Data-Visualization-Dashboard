import React, { createContext, useContext, useState, useCallback } from "react";

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  updatePerformance: (metrics: { fps: number; frameTime: number; renderTime: number }) => void;
}

const PerformanceMetricsContext = createContext<PerformanceMetrics>({
  fps: 0,
  frameTime: 0,
  renderTime: 0,
  updatePerformance: () => {},
});

export function PerformanceMetricsProvider({ children }: { children: React.ReactNode }) {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [renderTime, setRenderTime] = useState(0);

  const updatePerformance = useCallback((metrics: { fps: number; frameTime: number; renderTime: number }) => {
    setFps(Math.round(metrics.fps * 100) / 100);
    setFrameTime(Math.round(metrics.frameTime * 100) / 100);
    setRenderTime(Math.round(metrics.renderTime * 100) / 100);
  }, []);

  return (
    <PerformanceMetricsContext.Provider value={{ fps, frameTime, renderTime, updatePerformance }}>
      {children}
    </PerformanceMetricsContext.Provider>
  );
}

export function usePerformanceMetrics() {
  return useContext(PerformanceMetricsContext);
}
