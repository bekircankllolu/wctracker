import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Member } from "../members";

export type WcState = {
  occupant: string | null;
  entered_at: string | null;
  note: string | null;
};

type Status = "loading" | "ready" | "error";

const ROW_ID = 1;
const SELECT = "occupant, entered_at, note";

export function useWcState() {
  const [state, setState] = useState<WcState>({
    occupant: null,
    entered_at: null,
    note: null,
  });
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("wc_state")
      .select(SELECT)
      .eq("id", ROW_ID)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setStatus("error");
          return;
        }
        setState(data as WcState);
        setStatus("ready");
      });
    return () => {
      active = false;
    };
  }, []);

  // Realtime: başka bir cihazdaki değişiklikler anında yansır.
  useEffect(() => {
    const channel = supabase
      .channel("wc_state_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wc_state" },
        (payload) => setState(payload.new as WcState),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const enter = useCallback(async (member: Member) => {
    setBusy(true);
    // Sadece boşken gir (aynı anda ikinci kişiyi engelle).
    const { data, error } = await supabase
      .from("wc_state")
      .update({ occupant: member.name, entered_at: new Date().toISOString(), note: null })
      .eq("id", ROW_ID)
      .is("occupant", null)
      .select(SELECT)
      .maybeSingle();
    setBusy(false);
    if (!error && data) setState(data as WcState);
  }, []);

  const exit = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("wc_state")
      .update({ occupant: null, entered_at: null, note: null })
      .eq("id", ROW_ID)
      .select(SELECT)
      .single();
    setBusy(false);
    if (!error && data) setState(data as WcState);
  }, []);

  const updateNote = useCallback(async (note: string) => {
    const trimmed = note.trim();
    // İyimser güncelleme: yazan kişi anında görsün.
    setState((prev) => ({ ...prev, note: trimmed || null }));
    await supabase
      .from("wc_state")
      .update({ note: trimmed || null })
      .eq("id", ROW_ID)
      .not("occupant", "is", null);
  }, []);

  return { state, status, busy, enter, exit, updateNote };
}
