import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export type QueueEntry = {
  id: string;
  member_name: string;
  created_at: string;
};

const SELECT = "id, member_name, created_at";

export function useQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("queue")
      .select(SELECT)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (active && data) setQueue(data as QueueEntry[]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Kuyruk değişimlerini delta olarak uygula (tüm listeyi çekmeden).
  useEffect(() => {
    const byTime = (a: QueueEntry, b: QueueEntry) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    const channel = supabase
      .channel("queue_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue" },
        (payload) => {
          setQueue((prev) => {
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id?: string }).id;
              return prev.filter((q) => q.id !== oldId);
            }
            const row = payload.new as QueueEntry;
            if (payload.eventType === "INSERT") {
              if (prev.some((q) => q.id === row.id)) return prev;
              return [...prev, row].sort(byTime);
            }
            return prev.map((q) => (q.id === row.id ? row : q)).sort(byTime);
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const join = useCallback(async (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    // Optimistik ekle (aynı isim varsa tekrarlama).
    setQueue((prev) =>
      prev.some((q) => q.member_name === clean)
        ? prev
        : [...prev, { id: `temp-${clean}`, member_name: clean, created_at: new Date().toISOString() }],
    );
    await supabase
      .from("queue")
      .upsert({ member_name: clean }, { onConflict: "member_name", ignoreDuplicates: true });
  }, []);

  const leave = useCallback(async (name: string) => {
    const clean = name.trim();
    setQueue((prev) => prev.filter((q) => q.member_name !== clean));
    await supabase.from("queue").delete().eq("member_name", clean);
  }, []);

  return { queue, join, leave };
}
