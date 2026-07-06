import { useCallback, useEffect, useState } from "react";
import StatusCard from "./components/StatusCard";
import MemberGrid from "./components/MemberGrid";
import NotePanel from "./components/NotePanel";
import PhotoButton from "./components/PhotoButton";
import StatsPanel from "./components/StatsPanel";
import Chat from "./components/Chat";
import RosterEditor from "./components/RosterEditor";
import IdentityPicker from "./components/IdentityPicker";
import { useWcState } from "./lib/useWcState";
import { useMembers } from "./lib/useMembers";
import { useVisits } from "./lib/useVisits";
import { useMessages } from "./lib/useMessages";
import { usePoke } from "./lib/usePoke";
import { useIdentity } from "./lib/useIdentity";
import "./App.css";

export default function App() {
  const { state, status, busy, enter, exit, updateNote, updatePhoto } = useWcState();
  const { members, addMember, updateMember, removeMember } = useMembers();
  const { stats } = useVisits();
  const { messages, send } = useMessages();
  const { identity, setIdentity } = useIdentity();

  const [rosterOpen, setRosterOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [poked, setPoked] = useState(false);
  const [pokeToast, setPokeToast] = useState<string | null>(null);

  const onPoke = useCallback((from: string) => {
    setPoked(true);
    setPokeToast(`${from} dürttü! 👉`);
  }, []);
  const sendPoke = usePoke(onPoke);

  // Dürtme animasyonu/toast'unu bir süre sonra sıfırla.
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

  const occupied = Boolean(state.occupant);
  const current = members.find((m) => m.name === state.occupant);
  const canPoke = occupied && identity !== state.occupant;

  function requireIdentityThen(action: (name: string) => void) {
    if (identity) action(identity);
    else setIdentityOpen(true);
  }

  return (
    <div className={`app ${occupied ? "app-occupied" : "app-free"}`}>
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon" aria-hidden>🚽</span>
          <h1>WC Tracker</h1>
        </div>
        <button className="identity-chip" onClick={() => setIdentityOpen(true)}>
          {identity ? `Ben: ${identity} ▾` : "Ben kimim? ▾"}
        </button>
      </header>

      {status === "error" ? (
        <div className="notice error">
          Bağlantı kurulamadı. Supabase ayarlarını kontrol edin.
        </div>
      ) : status === "loading" ? (
        <div className="notice">Durum yükleniyor…</div>
      ) : (
        <main className="app-main">
          <StatusCard
            occupant={state.occupant}
            enteredAt={state.entered_at}
            note={state.note}
            photoUrl={state.photo_url}
            emoji={current?.emoji ?? "🚽"}
            color={current?.color ?? "#ff7a5a"}
            poked={poked}
          />

          {occupied ? (
            <>
              {canPoke ? (
                <button
                  className="poke-btn"
                  onClick={() => sendPoke(identity ?? "Biri")}
                >
                  👉 Dürt ({state.occupant})
                </button>
              ) : null}
              <NotePanel note={state.note} onSave={updateNote} />
              <PhotoButton hasPhoto={Boolean(state.photo_url)} onUploaded={updatePhoto} />
              <button className="exit-btn" disabled={busy} onClick={() => exit()}>
                Çıktım, tuvalet boşaldı 🎉
              </button>
            </>
          ) : (
            <MemberGrid
              members={members}
              disabled={busy}
              onEnter={enter}
              onManage={() => setRosterOpen(true)}
            />
          )}

          <StatsPanel stats={stats} />

          <Chat
            messages={messages}
            identity={identity}
            onSend={(body) => requireIdentityThen((name) => send(name, body))}
            onPickIdentity={() => setIdentityOpen(true)}
          />
        </main>
      )}

      <footer className="app-footer">Aile içi kullanım · canlı senkron 🔄</footer>

      {pokeToast ? <div className="poke-toast">{pokeToast}</div> : null}

      {rosterOpen ? (
        <RosterEditor
          members={members}
          onClose={() => setRosterOpen(false)}
          onAdd={addMember}
          onUpdate={updateMember}
          onRemove={removeMember}
        />
      ) : null}

      {identityOpen ? (
        <IdentityPicker
          members={members}
          identity={identity}
          onPick={setIdentity}
          onClose={() => setIdentityOpen(false)}
        />
      ) : null}
    </div>
  );
}
