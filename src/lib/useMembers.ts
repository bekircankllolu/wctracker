import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Member } from "../members";

const SELECT = "id, name, emoji, color, sort_order, avatar_url";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from("members")
      .select(SELECT)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!error && data) setMembers(data as Member[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Kadrodaki değişiklikler tüm cihazlara anında yansısın — tüm listeyi
  // yeniden çekmek yerine sadece değişen satırı uygula (daha az istek/render).
  useEffect(() => {
    const bySort = (a: Member, b: Member) => a.sort_order - b.sort_order;
    const channel = supabase
      .channel("members_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        (payload) => {
          setMembers((prev) => {
            if (payload.eventType === "DELETE") {
              const oldId = (payload.old as { id?: string }).id;
              return prev.filter((m) => m.id !== oldId);
            }
            const row = payload.new as Member;
            if (payload.eventType === "INSERT") {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, row].sort(bySort);
            }
            // UPDATE
            return prev.map((m) => (m.id === row.id ? row : m)).sort(bySort);
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addMember = useCallback(
    async (
      name: string,
      emoji: string,
      color: string,
      avatarUrl: string | null = null,
    ) => {
      const nextOrder =
        members.reduce((max, m) => Math.max(max, m.sort_order), 0) + 1;
      const { data, error } = await supabase
        .from("members")
        .insert({
          name: name.trim(),
          emoji,
          color,
          sort_order: nextOrder,
          avatar_url: avatarUrl,
        })
        .select(SELECT)
        .single();
      if (!error && data) setMembers((prev) => [...prev, data as Member]);
    },
    [members],
  );

  const updateMember = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Member, "name" | "emoji" | "color" | "avatar_url">>,
    ) => {
      const clean = { ...patch, ...(patch.name ? { name: patch.name.trim() } : {}) };
      const { data, error } = await supabase
        .from("members")
        .update(clean)
        .eq("id", id)
        .select(SELECT)
        .single();
      if (!error && data)
        setMembers((prev) => prev.map((m) => (m.id === id ? (data as Member) : m)));
    },
    [],
  );

  const removeMember = useCallback(async (id: string) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { members, loading, addMember, updateMember, removeMember };
}
