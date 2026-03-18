import { useEffect, useRef } from 'react';
 
/**
 * Runs `callback` every `intervalMs` while `active` is true.
 * Cleans up properly on unmount or when active becomes false.
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  active: boolean
) {
  const savedCb = useRef(callback);
 
  useEffect(() => { savedCb.current = callback; }, [callback]);
 
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => savedCb.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
}