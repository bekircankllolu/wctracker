import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export type WcState = {
  occupant: string | null;
  entered_at: string | null;
  note: string | null;
  photo_url: string | null;
  occupant_token: string | null;
  paper_level: number;
  smell_level: number; // 0 çok iyi, 1 iyi, 2 kötü, 3 çok kötü
  cooldown_until: string | null;
  smell_multiplier: number;
};

export type Phase = "free" | "occupied" | "cooldown";
type Status = "loading" | "ready" | "error";

const ROW_ID = 1;
const SELECT =
  "occupant, entered_at, note, photo_url, occupant_token, paper_level, smell_level, cooldown_until, smell_multiplier";
const TOKEN_KEY = "wc-occupant-token";
const COOLDOWN_BASE_MS = 3 * 60 * 1000; // leş kokuda 3 dk

const readToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
const writeToken = (t: string | null) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* */ } };
const newToken = () => { try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; } };

const EMPTY: WcState = {
  occupant: null, entered_at: null, note: null, photo_url: null, occupant_token: null,
  paper_level: 100, smell_level: 0, cooldown_until: null, smell_multiplier: 1,
};

export function useWcState() {
  const [state, setState] = useState<WcState>(EMPTY);
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [, bumpPhase] = useState(0); // sadece cooldown bittiğinde fazı tazelemek için
  const tokenRef = useRef<string | null>(readToken());

  useEffect(() => {
    let active = true;
    supabase.from("wc_state").select(SELECT).eq("id", ROW_ID).single().then(({ data, error }) => {
      if (!active) return;
      if (error) { setStatus("error"); return; }
      setState(data as WcState);
      setStatus("ready");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("wc_state_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "wc_state" },
        (payload) => setState(payload.new as WcState))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Havalandırma bitince fazı tazelemek için tek timeout (saniyelik render yok).
  useEffect(() => {
    if (state.occupant || !state.cooldown_until) return;
    const ms = new Date(state.cooldown_until).getTime() - Date.now();
    if (ms <= 0) return;
    const id = setTimeout(() => bumpPhase((t) => t + 1), ms + 250);
    return () => clearTimeout(id);
  }, [state.occupant, state.cooldown_until]);

  // Tuvalet boşaldıysa bu cihazdaki jetonu temizle.
  // Yalnızca durum yüklendikten sonra: aksi halde reload sırasında
  // (henüz occupant gelmeden) içerideki kişinin jetonu boşuna silinirdi.
  useEffect(() => {
    if (status === "ready" && !state.occupant && tokenRef.current) {
      tokenRef.current = null;
      writeToken(null);
    }
  }, [status, state.occupant]);

  const enter = useCallback(async (name: string) => {
    setBusy(true);
    const { data: cur } = await supabase
      .from("wc_state").select("cooldown_until, smell_multiplier").eq("id", ROW_ID).single();
    const inCooldown = Boolean(cur?.cooldown_until && new Date(cur.cooldown_until).getTime() > Date.now());
    const mult = inCooldown ? (cur?.smell_multiplier ?? 1) + 1 : 1; // koku çarpanı
    const token = newToken();
    const { data, error } = await supabase.from("wc_state")
      .update({
        occupant: name, entered_at: new Date().toISOString(), note: null, photo_url: null,
        occupant_token: token, cooldown_until: null, smell_level: 0, smell_multiplier: mult,
      })
      .eq("id", ROW_ID).is("occupant", null).select(SELECT).maybeSingle();
    setBusy(false);
    if (!error && data) { tokenRef.current = token; writeToken(token); setState(data as WcState); }
    return !error && Boolean(data);
  }, []);

  const exit = useCallback(async () => {
    setBusy(true);
    const { data: cur } = await supabase.from("wc_state")
      .select("occupant, entered_at, note, smell_level, smell_multiplier").eq("id", ROW_ID).single();
    const { data: cleared } = await supabase.from("wc_state")
      .update({ occupant: null, entered_at: null, note: null, photo_url: null, occupant_token: null,
        cooldown_until: (cur?.smell_level ?? 0) >= 3
          ? new Date(Date.now() + COOLDOWN_BASE_MS * (cur?.smell_multiplier ?? 1)).toISOString()
          : null,
        smell_multiplier: (cur?.smell_level ?? 0) >= 3 ? (cur?.smell_multiplier ?? 1) : 1 })
      .eq("id", ROW_ID).eq("occupant_token", tokenRef.current ?? "").select(SELECT).maybeSingle();
    if (cleared) {
      if (cur?.occupant && cur.entered_at) {
        const seconds = Math.max(0, Math.round((Date.now() - new Date(cur.entered_at).getTime()) / 1000));
        await supabase.from("visits").insert({
          member_name: cur.occupant, entered_at: cur.entered_at, exited_at: new Date().toISOString(),
          duration_seconds: seconds, note: cur.note ?? null,
        });
      }
      tokenRef.current = null; writeToken(null); setState(cleared as WcState);
    }
    setBusy(false);
  }, []);

  const guardedUpdate = useCallback(async (patch: Partial<WcState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    await supabase.from("wc_state").update(patch).eq("id", ROW_ID)
      .eq("occupant_token", tokenRef.current ?? "");
  }, []);

  const updateNote = useCallback((note: string) => {
    const t = note.trim();
    return guardedUpdate({ note: t || null });
  }, [guardedUpdate]);
  const updatePhoto = useCallback((url: string | null) => guardedUpdate({ photo_url: url }), [guardedUpdate]);
  const updateSmell = useCallback((level: number) => guardedUpdate({ smell_level: level }), [guardedUpdate]);

  // Kağıt herkes tarafından güncellenebilir (dolduran kişi).
  const updatePaper = useCallback(async (level: number) => {
    const v = Math.max(0, Math.min(100, Math.round(level)));
    setState((prev) => ({ ...prev, paper_level: v }));
    await supabase.from("wc_state").update({ paper_level: v }).eq("id", ROW_ID);
  }, []);

  const inCooldown =
    !state.occupant &&
    Boolean(state.cooldown_until) &&
    new Date(state.cooldown_until as string).getTime() > Date.now();
  const phase: Phase = state.occupant ? "occupied" : inCooldown ? "cooldown" : "free";
  const amOccupant =
    Boolean(state.occupant) && state.occupant_token != null && state.occupant_token === tokenRef.current;

  return {
    state, status, busy, phase, amOccupant,
    enter, exit, updateNote, updatePhoto, updateSmell, updatePaper,
  };
}
