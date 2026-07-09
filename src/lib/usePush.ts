import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Edge Function'daki ile aynı olmalı (public anahtar — paylaşılması güvenli).
const VAPID_PUBLIC = "BMZq1t6PzDqB3cogS3oWvK4KI0HIhpdT_ZmEEG__HCwPWhFP_SBO7x-84ZW-srK71UCo3pgXp5jrBJ2NCt5LtgI";

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export type NotifyPayload = {
  title: string;
  body: string;
  tag?: string;
  excludeEndpoint?: string;
  onlyMember?: string;
  excludeMember?: string;
};

const supported =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export function usePush() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  // Mevcut abonelik durumunu oku.
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub && Notification.permission === "granted") {
          setEnabled(true);
          setEndpoint(sub.endpoint);
        }
      })
      .catch(() => {});
  }, []);

  const enable = useCallback(async (identity: string | null) => {
    if (!supported) return false;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return false;
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC) as BufferSource,
        });
      }
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      await supabase.from("push_subscriptions").upsert(
        {
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          member_name: identity,
        },
        { onConflict: "endpoint" },
      );
      setEnabled(true);
      setEndpoint(sub.endpoint);
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    if (!supported) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setEnabled(false);
      setEndpoint(null);
    } catch {
      /* yoksay */
    } finally {
      setBusy(false);
    }
  }, []);

  // Diğer cihazlara bildirim gönder (Edge Function üzerinden).
  const sendPush = useCallback((payload: NotifyPayload) => {
    supabase.functions.invoke("notify", { body: payload }).catch(() => {});
  }, []);

  return { supported, enabled, busy, endpoint, enable, disable, sendPush };
}
