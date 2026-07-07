import { useEffect, useState } from "react";

// Girişten bu yana geçen saniye — yalnızca bu hook'u kullanan bileşen
// her saniye render olur (App ağacı değil).
export function useElapsed(enteredAt: string | null): number {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!enteredAt) return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [enteredAt]);
  if (!enteredAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(enteredAt).getTime()) / 1000));
}

// Verilen ana kalan milisaniye (>=0). Bittiğinde 0.
export function useCountdown(until: string | null): number {
  const [, tick] = useState(0);
  const remaining = until ? new Date(until).getTime() - Date.now() : 0;
  useEffect(() => {
    if (!until || remaining <= 0) return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [until, remaining > 0]);
  return Math.max(0, remaining);
}
