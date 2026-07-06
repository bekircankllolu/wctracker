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

  // Kadrodaki değişiklikler tüm cihazlara anında yansısın.
  useEffect(() => {
    const channel = supabase
      .channel("members_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => fetchMembers(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMembers]);

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
