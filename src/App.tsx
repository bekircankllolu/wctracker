import StatusCard from "./components/StatusCard";
import MemberButtons from "./components/MemberButtons";
import { useWcState } from "./lib/useWcState";
import "./App.css";

export default function App() {
  const { state, status, busy, enter, exit } = useWcState();
  const occupied = Boolean(state.occupant);

  return (
    <div className={`app ${occupied ? "app-occupied" : "app-free"}`}>
      <header className="app-header">
        <h1>
          <span aria-hidden>🚽</span> WC Tracker
        </h1>
        <p className="app-tagline">Evdeki tuvalet dolu mu, boş mu?</p>
      </header>

      {status === "error" ? (
        <div className="notice error">
          Bağlantı kurulamadı. Supabase ayarlarını (.env.local) kontrol edin.
        </div>
      ) : status === "loading" ? (
        <div className="notice">Durum yükleniyor…</div>
      ) : (
        <main className="app-main">
          <StatusCard occupant={state.occupant} enteredAt={state.entered_at} />

          {occupied ? (
            <button className="exit-btn" disabled={busy} onClick={() => exit()}>
              Çıktım ✅
            </button>
          ) : (
            <MemberButtons disabled={busy} onEnter={enter} />
          )}
        </main>
      )}

      <footer className="app-footer">Aile içi kullanım • canlı senkron 🔄</footer>
    </div>
  );
}
