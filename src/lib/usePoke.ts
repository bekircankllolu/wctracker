import { useCallback, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Dürtme, kalıcı kayıt gerektirmez; Supabase Realtime broadcast ile anlık gönderilir.
export function usePoke(onPoke: (from: string) => void) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlerRef = useRef(onPoke);
  handlerRef.current = onPoke;

  useEffect(() => {
    const channel = supabase
      .channel("poke", { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "poke" }, ({ payload }) => {
        handlerRef.current((payload as { from?: string })?.from ?? "Biri");
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  const sendPoke = useCallback((from: string) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "poke",
      payload: { from },
    });
  }, []);

  return sendPoke;
}
