import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export type Visit = {
  id: string;
  member_name: string;
  duration_seconds: number;
  created_at: string;
};

export type Leader = { name: string; value: number } | null;

export type MemberStat = { name: string; count: number; totalSeconds: number };

export type Stats = {
  totalVisits: number;
  mostVisits: Leader; // en çok giren (adet)
  longestStay: Leader; // tek seferde en uzun (saniye)
  mostTotalTime: Leader; // toplamda en çok süre (saniye)
  perMember: MemberStat[]; // kişi başı kırılım (çoktan aza)
};

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("visits")
      .select("id, member_name, duration_seconds, created_at")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        if (active && data) setVisits(data as Visit[]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Yeni ziyaretler anında istatistiklere yansısın.
  useEffect(() => {
    const channel = supabase
      .channel("visits_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visits" },
        (payload) => setVisits((prev) => [payload.new as Visit, ...prev]),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = useMemo<Stats>(() => {
    const counts = new Map<string, number>();
    const totals = new Map<string, number>();
    let longest: Leader = null;

    for (const v of visits) {
      counts.set(v.member_name, (counts.get(v.member_name) ?? 0) + 1);
      totals.set(
        v.member_name,
        (totals.get(v.member_name) ?? 0) + v.duration_seconds,
      );
      if (!longest || v.duration_seconds > longest.value) {
        longest = { name: v.member_name, value: v.duration_seconds };
      }
    }

    const top = (m: Map<string, number>): Leader => {
      let best: Leader = null;
      for (const [name, value] of m) {
        if (!best || value > best.value) best = { name, value };
      }
      return best;
    };

    const perMember: MemberStat[] = [...counts.keys()]
      .map((name) => ({
        name,
        count: counts.get(name) ?? 0,
        totalSeconds: totals.get(name) ?? 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalVisits: visits.length,
      mostVisits: top(counts),
      longestStay: longest,
      mostTotalTime: top(totals),
      perMember,
    };
  }, [visits]);

  return { stats };
}
