import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export type WcState = {
  occupant: string | null;
  entered_at: string | null;
  note: string | null;
  photo_url: string | null;
  occupant_token: string | null;
};

type Status = "loading" | "ready" | "error";

const ROW_ID = 1;
const SELECT = "occupant, entered_at, note, photo_url, occupant_token";
const TOKEN_KEY = "wc-occupant-token";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* yoksay */
  }
}
function newToken(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function useWcState() {
  const [state, setState] = useState<WcState>({
    occupant: null,
    entered_at: null,
    note: null,
    photo_url: null,
    occupant_token: null,
  });
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  // Bu cihazın, mevcut oturumu açan cihaz olduğunu kanıtlayan jeton.
  const tokenRef = useRef<string | null>(readToken());

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

  // Tuvalet boşaldıysa bu cihazdaki eski jetonu temizle.
  useEffect(() => {
    if (!state.occupant && tokenRef.current) {
      tokenRef.current = null;
      writeToken(null);
    }
  }, [state.occupant]);

  const enter = useCallback(async (name: string) => {
    setBusy(true);
    const token = newToken();
    const { data, error } = await supabase
      .from("wc_state")
      .update({
        occupant: name,
        entered_at: new Date().toISOString(),
        note: null,
        photo_url: null,
        occupant_token: token,
      })
      .eq("id", ROW_ID)
      .is("occupant", null)
      .select(SELECT)
      .maybeSingle();
    setBusy(false);
    if (!error && data) {
      tokenRef.current = token;
      writeToken(token);
      setState(data as WcState);
    }
  }, []);

  const exit = useCallback(async () => {
    setBusy(true);
    // Çıkış öncesi mevcut kaydı oku (ziyaret geçmişi için).
    const { data: cur } = await supabase
      .from("wc_state")
      .select("occupant, entered_at, note")
      .eq("id", ROW_ID)
      .single();
    // Yalnızca bu oturumu açan cihaz (jeton sahibi) boşaltabilir.
    const { data: cleared } = await supabase
      .from("wc_state")
      .update({ occupant: null, entered_at: null, note: null, photo_url: null, occupant_token: null })
      .eq("id", ROW_ID)
      .eq("occupant_token", tokenRef.current ?? "")
      .select(SELECT)
      .maybeSingle();
    if (cleared) {
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
      tokenRef.current = null;
      writeToken(null);
      setState(cleared as WcState);
    }
    setBusy(false);
  }, []);

  const updateNote = useCallback(async (note: string) => {
    const trimmed = note.trim();
    setState((prev) => ({ ...prev, note: trimmed || null }));
    await supabase
      .from("wc_state")
      .update({ note: trimmed || null })
      .eq("id", ROW_ID)
      .eq("occupant_token", tokenRef.current ?? "");
  }, []);

  const updatePhoto = useCallback(async (photoUrl: string | null) => {
    setState((prev) => ({ ...prev, photo_url: photoUrl }));
    await supabase
      .from("wc_state")
      .update({ photo_url: photoUrl })
      .eq("id", ROW_ID)
      .eq("occupant_token", tokenRef.current ?? "");
  }, []);

  // Bu cihaz, mevcut oturumu açan cihaz mı?
  const amOccupant =
    Boolean(state.occupant) &&
    state.occupant_token != null &&
    state.occupant_token === tokenRef.current;

  return { state, status, busy, amOccupant, enter, exit, updateNote, updatePhoto };
}
