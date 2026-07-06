import { useState } from "react";
import StatusCard from "./components/StatusCard";
import MemberGrid from "./components/MemberGrid";
import NotePanel from "./components/NotePanel";
import RosterEditor from "./components/RosterEditor";
import { useWcState } from "./lib/useWcState";
import { useMembers } from "./lib/useMembers";
import "./App.css";

export default function App() {
  const { state, status, busy, enter, exit, updateNote } = useWcState();
  const { members, addMember, updateMember, removeMember } = useMembers();
  const [rosterOpen, setRosterOpen] = useState(false);

  const occupied = Boolean(state.occupant);
  const current = members.find((m) => m.name === state.occupant);

  return (
    <div className={`app ${occupied ? "app-occupied" : "app-free"}`}>
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon" aria-hidden>🚽</span>
          <h1>WC Tracker</h1>
        </div>
        <p className="app-tagline">Evde tuvalet dolu mu, boş mu?</p>
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
            emoji={current?.emoji ?? "🚽"}
            color={current?.color ?? "#ff7a5a"}
          />

          {occupied ? (
            <>
              <NotePanel note={state.note} onSave={updateNote} />
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
        </main>
      )}

      <footer className="app-footer">Aile içi kullanım · canlı senkron 🔄</footer>

      {rosterOpen ? (
        <RosterEditor
          members={members}
          onClose={() => setRosterOpen(false)}
          onAdd={addMember}
          onUpdate={updateMember}
          onRemove={removeMember}
        />
      ) : null}
    </div>
  );
}
