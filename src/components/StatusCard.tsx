import Avatar from "./Avatar";
import AppIcon from "./AppIcon";
import { useElapsed, useCountdown } from "../lib/timers";
import type { Phase } from "../lib/useWcState";

type Props = {
  phase: Phase;
  occupant: string | null;
  enteredAt: string | null;
  note: string | null;
  photoUrl: string | null;
  emoji: string;
  color: string;
  avatarUrl: string | null;
  amOccupant: boolean;
  identity: string | null;
  poked: boolean;
  cooldownUntil: string | null;
  multiplier: number;
};

const pad = (n: number) => n.toString().padStart(2, "0");
function clock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

export default function StatusCard({
  phase, occupant, enteredAt, note, photoUrl, emoji, color, avatarUrl, amOccupant, identity, poked, cooldownUntil, multiplier,
}: Props) {
  const elapsed = useElapsed(phase === "occupied" ? enteredAt : null);
  const cooldownMs = useCountdown(phase === "cooldown" ? cooldownUntil : null);

  if (phase === "cooldown") {
    return (
      <div className="hero hero--butter hero--center">
        <span className="hero-pill self">● HAVALANDIRILIYOR</span>
        <span className="hero-emoji hero-icon hero-icon--smell" aria-hidden><AppIcon name="smell-awful" /></span>
        <span className="hero-clock">{mmss(cooldownMs)}</span>
        <span className="hero-sub center">Leş gibi kokuyor, biraz bekleyelim</span>
        {multiplier > 1 ? <span className="hero-chip">koku çarpanı ×{multiplier}</span> : null}
      </div>
    );
  }

  if (phase === "free") {
    return (
      <div className="hero hero--mint hero--bg-free hero--center">
        <span className="hero-pill self">● BOŞ</span>
        <div className="hero-center-block">
          <span className="hero-emoji hero-icon hero-icon--toilet big" aria-hidden><AppIcon name="toilet" /></span>
          <span className="hero-title">Müsait</span>
          <span className="hero-sub center">Tuvalet boş, buyurun</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`hero hero--peach hero--bg-occupied ${poked ? "poked" : ""}`}>
      <div className="hero-top">
        <span className="hero-pill">{amOccupant ? "● SEN İÇERİDESİN" : "● DOLU"}</span>
        <span className="hero-avatar">
          {avatarUrl ? (
            <Avatar emoji={emoji} color={color} avatarUrl={avatarUrl} size={52} />
          ) : (
            <span className="hero-avatar-emoji" aria-hidden>{emoji}</span>
          )}
        </span>
      </div>
      <div className="hero-time-block">
        <span className="hero-time">{clock(elapsed)}</span>
        <span className="hero-sub">
          {amOccupant ? `Rahat ol ${identity}, süre işliyor 🚽` : `${occupant} içeride · şu kadar süredir 🚽`}
        </span>
      </div>
      {note ? <span className="hero-note">“{note}”</span> : null}
      {photoUrl ? <img className="hero-photo" src={photoUrl} alt="Tuvaletten kare" loading="lazy" /> : null}
    </div>
  );
}
