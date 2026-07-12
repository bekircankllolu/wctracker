import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { MAX_REASONABLE_STAY } from "./format";

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
  mostVisits: Leader;
  longestStay: Leader;
  mostTotalTime: Leader;
  perMember: MemberStat[];
};

function computeStats(allVisits: Visit[]): Stats {
  // Anormal (sayaç durdurulmamış) oturumları istatistik dışı bırak.
  const visits = allVisits.filter((v) => v.duration_seconds <= MAX_REASONABLE_STAY);
  const counts = new Map<string, number>();
  const totals = new Map<string, number>();
  let longest: Leader = null;

  for (const v of visits) {
    counts.set(v.member_name, (counts.get(v.member_name) ?? 0) + 1);
    totals.set(v.member_name, (totals.get(v.member_name) ?? 0) + v.duration_seconds);
    if (!longest || v.duration_seconds > longest.value) {
      longest = { name: v.member_name, value: v.duration_seconds };
    }
  }

  const top = (m: Map<string, number>): Leader => {
    let best: Leader = null;
    for (const [name, value] of m) if (!best || value > best.value) best = { name, value };
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
}

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

  const stats = useMemo(() => computeStats(visits), [visits]);
  const statsWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    return computeStats(visits.filter((v) => new Date(v.created_at).getTime() >= weekAgo));
  }, [visits]);

  return { stats, statsWeek, visits };
}
