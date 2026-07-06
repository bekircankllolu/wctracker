import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Member } from "../members";

export type WcState = {
  occupant: string | null;
  entered_at: string | null;
  note: string | null;
  photo_url: string | null;
};

type Status = "loading" | "ready" | "error";

const ROW_ID = 1;
const SELECT = "occupant, entered_at, note, photo_url";

export function useWcState() {
  const [state, setState] = useState<WcState>({
    occupant: null,
    entered_at: null,
    note: null,
    photo_url: null,
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
      .update({
        occupant: member.name,
        entered_at: new Date().toISOString(),
        note: null,
        photo_url: null,
      })
      .eq("id", ROW_ID)
      .is("occupant", null)
      .select(SELECT)
      .maybeSingle();
    setBusy(false);
    if (!error && data) setState(data as WcState);
  }, []);

  const exit = useCallback(async () => {
    setBusy(true);
    // Çıkışta tamamlanan ziyareti geçmişe yaz (istatistikler için).
    const { data: cur } = await supabase
      .from("wc_state")
      .select("occupant, entered_at, note")
      .eq("id", ROW_ID)
      .single();
    if (cur?.occupant && cur.entered_at) {
      const seconds = Math.max(
        0,
        Math.round((Date.now() - new Date(cur.entered_at).getTime()) / 1000),
      );
      await supabase.from("visits").insert({
        member_name: cur.occupant,
        entered_at: cur.entered_at,
        exited_at: new Date().toISOString(),
        duration_seconds: seconds,
        note: cur.note ?? null,
      });
    }
    const { data, error } = await supabase
      .from("wc_state")
      .update({ occupant: null, entered_at: null, note: null, photo_url: null })
      .eq("id", ROW_ID)
      .select(SELECT)
      .single();
    setBusy(false);
    if (!error && data) setState(data as WcState);
  }, []);

  const updateNote = useCallback(async (note: string) => {
    const trimmed = note.trim();
    setState((prev) => ({ ...prev, note: trimmed || null }));
    await supabase
      .from("wc_state")
      .update({ note: trimmed || null })
      .eq("id", ROW_ID)
      .not("occupant", "is", null);
  }, []);

  const updatePhoto = useCallback(async (photoUrl: string | null) => {
    setState((prev) => ({ ...prev, photo_url: photoUrl }));
    await supabase
      .from("wc_state")
      .update({ photo_url: photoUrl })
      .eq("id", ROW_ID)
      .not("occupant", "is", null);
  }, []);

  return { state, status, busy, enter, exit, updateNote, updatePhoto };
}
