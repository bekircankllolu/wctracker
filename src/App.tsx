import { useCallback, useEffect, useRef, useState } from "react";
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
import QueuePanel from "./components/QueuePanel";
import Menu from "./components/Menu";
import BottomNav, { type Tab } from "./components/BottomNav";
import Skeleton from "./components/Skeleton";
import { useTheme } from "./lib/useTheme";
import { useWcState } from "./lib/useWcState";
import { useMembers } from "./lib/useMembers";
import { useVisits } from "./lib/useVisits";
import { useMessages } from "./lib/useMessages";
import { useQueue } from "./lib/useQueue";
import { usePoke } from "./lib/usePoke";
import { useIdentity } from "./lib/useIdentity";
import "./App.css";

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* desteklenmiyorsa yoksay */
  }
}

const TAB_META: Record<Tab, { icon: string; title: string }> = {
  durum: { icon: "✨", title: "Tuvalet Takip" },
  sohbet: { icon: "💬", title: "Sohbet" },
  takvim: { icon: "📅", title: "Takvim" },
};

export default function App() {
  const {
    state, status, busy, phase, amOccupant,
    enter, exit, updateNote, updatePhoto, updateSmell, updatePaper,
  } = useWcState();
  const { members, addMember, updateMember, removeMember } = useMembers();
  const { stats, statsWeek, visits } = useVisits();
  const { messages, send } = useMessages();
  const { queue, join: joinQueue, leave: leaveQueue } = useQueue();
  const { identity, setIdentity } = useIdentity();
  const { theme, setTheme } = useTheme();

  const [tab, setTab] = useState<Tab>("durum");
  const [menuOpen, setMenuOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [poked, setPoked] = useState(false);
  const [pokeToast, setPokeToast] = useState<string | null>(null);

  const onPoke = useCallback((from: string) => {
    setPoked(true);
    setPokeToast(`${from} dürttü! 👉`);
    vibrate([30, 50, 30]);
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

  // "Sıra sende" bildirimini transisyon anında bir kez göstermek için kuyruğun
  // başını referansta tut (efekt yalnızca occupant değişince çalışsın diye).
  const queueHeadRef = useRef<string | null>(null);
  queueHeadRef.current = queue[0]?.member_name ?? null;

  // Biri girince/çıkınca herkese mini toast + hafif titreşim.
  const prevOcc = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (status !== "ready") return;
    const prev = prevOcc.current;
    if (prev !== undefined && prev !== state.occupant) {
      if (state.occupant && state.occupant !== identity) {
        setPokeToast(`${state.occupant} tuvalete girdi 🚽`);
        vibrate(25);
      } else if (!state.occupant && prev) {
        // Tuvalet boşaldı: sıradaki kişi bensem özel bildirim.
        if (identity && queueHeadRef.current === identity) {
          setPokeToast("Sıra sende! 🚽 Hadi bakalım");
          vibrate([40, 60, 40]);
        } else {
          setPokeToast("Tuvalet boşaldı ✅");
        }
      }
    }
    prevOcc.current = state.occupant;
  }, [status, state.occupant, identity]);

  const handleEnter = () => {
    vibrate(15);
    if (identity) {
      enter(identity);
      leaveQueue(identity); // girince kuyruktan düş
    } else setIdentityOpen(true);
  };

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
    tab === "takvim" ? <span className="visit-pill">{stats.totalVisits} ziyaret</span> : avatarBtn;

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
        onMenu={() => setMenuOpen(true)}
      />

      {status === "error" ? (
        <div className="notice error">Bağlantı kurulamadı. Supabase ayarlarını kontrol edin.</div>
      ) : status === "loading" ? (
        <Skeleton />
      ) : (
        <main className="app-main" key={tab}>
          {tab === "durum" ? (
            <>
              {phase === "occupied" ? <StatusBanner occupant={state.occupant} enteredAt={state.entered_at} /> : null}

              <StatusCard
                phase={phase}
                occupant={state.occupant}
                enteredAt={state.entered_at}
                note={state.note}
                photoUrl={state.photo_url}
                emoji={current?.emoji ?? "🚽"}
                color={current?.color ?? "#f2711c"}
                avatarUrl={current?.avatar_url ?? null}
                poked={poked}
                cooldownUntil={state.cooldown_until}
                multiplier={state.smell_multiplier}
              />

              {phase === "occupied" && amOccupant ? <NotePanel note={state.note} onSave={updateNote} /> : null}

              {meters}

              {phase !== "free" ? (
                <QueuePanel
                  queue={queue}
                  members={members}
                  identity={identity}
                  occupant={state.occupant}
                  onJoin={() => { if (identity) { vibrate(15); joinQueue(identity); } }}
                  onLeave={() => { if (identity) leaveQueue(identity); }}
                />
              ) : null}

              {phase === "occupied" ? (
                amOccupant ? (
                  <>
                    <PhotoButton hasPhoto={Boolean(state.photo_url)} onUploaded={updatePhoto} />
                    <button className="exit-btn" disabled={busy} onClick={() => { vibrate(20); exit(); }}>Çıktım, tuvalet boşaldı 🎉</button>
                  </>
                ) : (
                  <>
                    {canPoke ? (
                      <button className="poke-btn" onClick={() => { vibrate(15); sendPoke(identity ?? "Biri"); }}>👉 Dürt ({state.occupant})</button>
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
          ) : tab === "sohbet" ? (
            <Chat
              messages={messages}
              identity={identity}
              onSend={(body) => (identity ? send(identity, body) : setIdentityOpen(true))}
              onPickIdentity={() => setIdentityOpen(true)}
            />
          ) : (
            <>
              <Calendar members={members} visits={visits} />
              <StatsPanel stats={stats} statsWeek={statsWeek} members={members} />
            </>
          )}
        </main>
      )}

      <BottomNav active={tab} onChange={setTab} />

      {pokeToast ? <div className="poke-toast">{pokeToast}</div> : null}

      {menuOpen ? (
        <Menu
          theme={theme}
          onTheme={setTheme}
          me={me}
          memberCount={members.length}
          onManageRoster={() => setRosterOpen(true)}
          onPickIdentity={() => setIdentityOpen(true)}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
      {rosterOpen ? (
        <RosterEditor members={members} onClose={() => setRosterOpen(false)} onAdd={addMember} onUpdate={updateMember} onRemove={removeMember} />
      ) : null}
      {identityOpen ? (
        <IdentityPicker members={members} identity={identity} onPick={setIdentity} onClose={() => setIdentityOpen(false)} />
      ) : null}
    </div>
  );
}
