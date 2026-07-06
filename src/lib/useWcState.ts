import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export type WcState = {
  occupant: string | null;
  entered_at: string | null;
};

type Status = "loading" | "ready" | "error";

const ROW_ID = 1;

export function useWcState() {
  const [state, setState] = useState<WcState>({ occupant: null, entered_at: null });
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  // İlk yükleme: mevcut durumu çek.
  useEffect(() => {
    let active = true;
    supabase
      .from("wc_state")
      .select("occupant, entered_at")
      .eq("id", ROW_ID)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setStatus("error");
          return;
        }
        setState({ occupant: data.occupant, entered_at: data.entered_at });
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
        (payload) => {
          const next = payload.new as WcState;
          setState({ occupant: next.occupant, entered_at: next.entered_at });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const enter = useCallback(async (name: string) => {
    setBusy(true);
    // Sadece boşken gir (aynı anda ikinci kişiyi engelle).
    const { data, error } = await supabase
      .from("wc_state")
      .update({ occupant: name, entered_at: new Date().toISOString() })
      .eq("id", ROW_ID)
      .is("occupant", null)
      .select("occupant, entered_at")
      .maybeSingle();
    setBusy(false);
    if (!error && data) {
      setState({ occupant: data.occupant, entered_at: data.entered_at });
    }
  }, []);

  const exit = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("wc_state")
      .update({ occupant: null, entered_at: null })
      .eq("id", ROW_ID)
      .select("occupant, entered_at")
      .single();
    setBusy(false);
    if (!error && data) {
      setState({ occupant: data.occupant, entered_at: data.entered_at });
    }
  }, []);

  return { state, status, busy, enter, exit };
}
