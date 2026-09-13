import { useEffect, useRef } from "react";
export function useWorker() {
  const ref = useRef<Worker | null>(null);
  useEffect(() => {
    const url = new URL("../workers/dataProcessor.worker.ts", import.meta.url);
    // Vite handles .ts worker; fall back to inline message for demo
    ref.current = new Worker(url, { type: "module" });
    return () => { if (ref.current) { ref.current.terminate(); ref.current = null; } };
  }, []);
  const post = (msg: any) => ref.current?.postMessage(msg);
  return { post };
}
