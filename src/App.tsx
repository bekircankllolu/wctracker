import { useCallback, useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import StatusCard from "./components/StatusCard";
import StatusBanner from "./components/StatusBanner";
import Avatar from "./components/Avatar";
import EnterPanel from "./components/EnterPanel";
import NotePanel from "./components/NotePanel";
import PhotoButton from "./components/PhotoButton";
import ToiletMeters from "./components/ToiletMeters";
import StatsPanel from "./components/StatsPanel";
import Chat from "./components/Chat";
import Calendar from "./components/Calendar";
import RosterEditor from "./components/RosterEditor";
import IdentityPicker from "./components/IdentityPicker";
import BottomNav, { type Tab } from "./components/BottomNav";
import { useWcState } from "./lib/useWcState";
import { useMembers } from "./lib/useMembers";
import { useVisits } from "./lib/useVisits";
import { useMessages } from "./lib/useMessages";
import { usePoke } from "./lib/usePoke";
import { useIdentity } from "./lib/useIdentity";
import "./App.css";

const TAB_META: Record<Tab, { icon: string; title: string }> = {
  durum: { icon: "✨", title: "Tuvalet Takip" },
  siralama: { icon: "🏆", title: "Sıralama" },
  takvim: { icon: "📅", title: "Takvim" },
};

export default function App() {
  const {
    state, status, busy, phase, amOccupant, cooldownMs, now,
    enter, exit, updateNote, updatePhoto, updateSmell, updatePaper,
  } = useWcState();
  const { members, addMember, updateMember, removeMember } = useMembers();
  const { stats, statsWeek, visits } = useVisits();
  const { messages, send } = useMessages();
  const { identity, setIdentity } = useIdentity();

  const [tab, setTab] = useState<Tab>("durum");
  const [rosterOpen, setRosterOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [poked, setPoked] = useState(false);
  const [pokeToast, setPokeToast] = useState<string | null>(null);

  const onPoke = useCallback((from: string) => {
    setPoked(true);
    setPokeToast(`${from} dürttü! 👉`);
  }, []);
  const sendPoke = usePoke(onPoke);

  useEffect(() => {
    if (!poked) return;
    const t = setTimeout(() => setPoked(false), 700);
    return () => clearTimeout(t);
  }, [poked]);
  useEffect(() => {
    if (!pokeToast) return;
    const t = setTimeout(() => setPokeToast(null), 2200);
    return () => clearTimeout(t);
  }, [pokeToast]);

  const current = members.find((m) => m.name === state.occupant);
  const me = members.find((m) => m.name === identity);
  const canPoke = phase === "occupied" && !amOccupant && identity !== state.occupant;
  const elapsedSec = state.entered_at
    ? Math.max(0, Math.floor((now - new Date(state.entered_at).getTime()) / 1000))
    : 0;

  const handleEnter = () => (identity ? enter(identity) : setIdentityOpen(true));

  const avatarBtn = (
    <button
      className="avatar-chip"
      onClick={() => setIdentityOpen(true)}
      style={me ? ({ ["--me-color" as string]: me.color }) : undefined}
      aria-label="Ben kimim?"
    >
      {me ? <Avatar emoji={me.emoji} color={me.color} avatarUrl={me.avatar_url} size={38} /> : <span className="avatar-emoji">🙂</span>}
    </button>
  );
  const rightSlot =
    tab === "siralama" ? <span className="visit-pill">{stats.totalVisits} ziyaret</span> : avatarBtn;

  const meters = (
    <ToiletMeters
      paperLevel={state.paper_level}
      smellLevel={state.smell_level}
      canSetSmell={amOccupant}
      onPaper={updatePaper}
      onSmell={updateSmell}
    />
  );

  return (
    <div className="app">
      <TopBar
        icon={TAB_META[tab].icon}
        title={TAB_META[tab].title}
        right={rightSlot}
        onMenu={() => setRosterOpen(true)}
      />

      {status === "error" ? (
        <div className="notice error">Bağlantı kurulamadı. Supabase ayarlarını kontrol edin.</div>
      ) : status === "loading" ? (
        <div className="notice">Durum yükleniyor…</div>
      ) : (
        <main className="app-main" key={tab}>
          {tab === "durum" ? (
            <>
              {phase === "occupied" ? <StatusBanner occupant={state.occupant} elapsedSec={elapsedSec} /> : null}

              <StatusCard
                phase={phase}
                occupant={state.occupant}
                elapsedSec={elapsedSec}
                note={state.note}
                photoUrl={state.photo_url}
                emoji={current?.emoji ?? "🚽"}
                color={current?.color ?? "#f2711c"}
                avatarUrl={current?.avatar_url ?? null}
                poked={poked}
                cooldownMs={cooldownMs}
                multiplier={state.smell_multiplier}
              />

              {phase === "occupied" && amOccupant ? <NotePanel note={state.note} onSave={updateNote} /> : null}

              {meters}

              {phase === "occupied" ? (
                amOccupant ? (
                  <>
                    <PhotoButton hasPhoto={Boolean(state.photo_url)} onUploaded={updatePhoto} />
                    <button className="exit-btn" disabled={busy} onClick={() => exit()}>Çıktım, tuvalet boşaldı 🎉</button>
                  </>
                ) : (
                  <>
                    {canPoke ? (
                      <button className="poke-btn" onClick={() => sendPoke(identity ?? "Biri")}>👉 Dürt ({state.occupant})</button>
                    ) : null}
                    <div className="lock-hint">🔒 Durumu yalnızca <strong>{state.occupant}</strong> (giren cihaz) değiştirebilir.</div>
                  </>
                )
              ) : phase === "cooldown" ? (
                <button className="poke-btn" disabled={busy} onClick={handleEnter}>😬 Yine de gir (koku çarpanı artar)</button>
              ) : (
                <EnterPanel identity={identity} disabled={busy} onEnter={handleEnter} onPickIdentity={() => setIdentityOpen(true)} onManage={() => setRosterOpen(true)} />
              )}
            </>
          ) : tab === "siralama" ? (
            <>
              <StatsPanel stats={stats} statsWeek={statsWeek} members={members} />
              <Chat
                messages={messages}
                identity={identity}
                onSend={(body) => (identity ? send(identity, body) : setIdentityOpen(true))}
                onPickIdentity={() => setIdentityOpen(true)}
              />
            </>
          ) : (
            <Calendar members={members} visits={visits} />
          )}
        </main>
      )}

      <BottomNav active={tab} onChange={setTab} />

      {pokeToast ? <div className="poke-toast">{pokeToast}</div> : null}

      {rosterOpen ? (
        <RosterEditor members={members} onClose={() => setRosterOpen(false)} onAdd={addMember} onUpdate={updateMember} onRemove={removeMember} />
      ) : null}
      {identityOpen ? (
        <IdentityPicker members={members} identity={identity} onPick={setIdentity} onClose={() => setIdentityOpen(false)} />
      ) : null}
    </div>
  );
}
