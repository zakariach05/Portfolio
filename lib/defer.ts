/**
 * Defer execution until browser is idle — TBT optimization.
 * Falls back to setTimeout if requestIdleCallback not available.
 * Used for GSAP/ScrollTrigger/Lenis init after first paint.
 */
export function onIdle(callback: () => void, timeout = 2000): () => void {
  if (typeof window === "undefined") return () => {};
  let id: number | NodeJS.Timeout;
  let cancelled = false;

  const wrapped = () => {
    if (!cancelled) callback();
  };

  if ("requestIdleCallback" in window) {
    // @ts-ignore
    id = window.requestIdleCallback(wrapped, { timeout });
    return () => {
      cancelled = true;
      // @ts-ignore
      window.cancelIdleCallback(id);
    };
  } else {
    // Fallback: delay 300ms after load to avoid blocking FCP/LCP
    id = setTimeout(wrapped, 300);
    return () => {
      cancelled = true;
      clearTimeout(id as NodeJS.Timeout);
    };
  }
}

/**
 * Split a synchronous task into micro-tasks to avoid >50ms long tasks.
 * Example: setup 10 ScrollTriggers → yield every 2.
 */
export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if ("scheduler" in window && (window as any).scheduler?.postTask) {
      (window as any).scheduler.postTask(resolve, { priority: "background" });
    } else {
      setTimeout(resolve, 0);
    }
  });
}
