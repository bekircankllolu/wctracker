import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export type Message = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
};

export const CHAT_MAX = 100;

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("messages")
      .select("id, sender, body, created_at")
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
    await supabase.from("messages").insert({ sender, body: trimmed });
  }, []);

  return { messages, send };
}
