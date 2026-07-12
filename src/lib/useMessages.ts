import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export type Message = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
  pending?: boolean; // optimistik: henüz sunucuya yazılmadı
  failed?: boolean; // gönderilemedi
};

export const CHAT_MAX = 100;
const SELECT = "id, sender, body, created_at";

function tempId() {
  return `temp-${(crypto as { randomUUID?: () => string }).randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("messages")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (active && data) setMessages((data as Message[]).reverse());
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => {
            const msg = payload.new as Message;
            if (prev.some((m) => m.id === msg.id)) return prev;
            // Kendi optimistik mesajımızın echo'su geldiyse onu gerçekle değiştir.
            const idx = prev.findIndex(
              (m) => m.pending && m.sender === msg.sender && m.body === msg.body,
            );
            if (idx >= 0) {
              const copy = prev.slice();
              copy[idx] = msg;
              return copy;
            }
            return [...prev, msg].slice(-50);
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const send = useCallback(async (sender: string, body: string) => {
    const trimmed = body.trim().slice(0, CHAT_MAX);
    if (!trimmed) return;

    // 1) Anında ekranda göster (optimistik).
    const id = tempId();
    const optimistic: Message = {
      id,
      sender,
      body: trimmed,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic].slice(-50));

    // 2) Sunucuya yaz, dönen gerçek satırla uzlaştır.
    const { data, error } = await supabase
      .from("messages")
      .insert({ sender, body: trimmed })
      .select(SELECT)
      .single();

    setMessages((prev) => {
      if (error || !data) {
        return prev.map((m) => (m.id === id ? { ...m, pending: false, failed: true } : m));
      }
      const real = data as Message;
      const withoutTemp = prev.filter((m) => m.id !== id);
      // Realtime echo bizden önce eklediyse tekrar ekleme.
      if (withoutTemp.some((m) => m.id === real.id)) return withoutTemp;
      return [...withoutTemp, real];
    });
  }, []);

  // Görüntü sırası her zaman gönderim zamanına göre (array-push sırasına değil).
  // Eşit zaman damgasında kararlı kal (id'ye göre).
  const sorted = useMemo(
    () =>
      [...messages].sort((a, b) => {
        const d = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return d !== 0 ? d : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      }),
    [messages],
  );

  return { messages: sorted, send };
}
