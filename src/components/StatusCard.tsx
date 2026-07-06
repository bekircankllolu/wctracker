import RadialTimer from "./RadialTimer";
import type { Phase } from "../lib/useWcState";

type Props = {
  phase: Phase;
  occupant: string | null;
  elapsedSec: number;
  note: string | null;
  photoUrl: string | null;
  emoji: string;
  color: string;
  avatarUrl: string | null;
  poked: boolean;
  cooldownMs: number;
  multiplier: number;
};

const pad = (n: number) => n.toString().padStart(2, "0");
function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}

export default function StatusCard({
  phase, occupant, elapsedSec, note, photoUrl, emoji, color, avatarUrl, poked, cooldownMs, multiplier,
}: Props) {
  if (phase === "cooldown") {
    return (
      <div className="status-hero cooldown">
        <div className="cd-emoji" aria-hidden>💨</div>
        <div className="cd-title">HAVALANDIRILIYOR</div>
        <div className="cd-clock">{mmss(cooldownMs)}</div>
        <div className="cd-sub">Leş gibi kokuyor, biraz bekleyelim 🤢</div>
        {multiplier > 1 ? <div className="cd-mult">koku çarpanı ×{multiplier}</div> : null}
      </div>
    );
  }

  if (phase === "free") {
    return (
      <div className="status-hero free">
        <div className="hero-emoji-wrap"><span className="hero-emoji" aria-hidden>🚽</span></div>
        <div className="hero-title">MÜSAİT</div>
        <div className="hero-sub">Tuvalet boş, buyurun 🙌</div>
      </div>
    );
  }

  return (
    <div className={`status-hero occupied ${poked ? "poked" : ""}`}>
      <RadialTimer seconds={elapsedSec} name={occupant ?? ""} emoji={emoji} color={color} avatarUrl={avatarUrl} />
      {note ? <div className="hero-note">“{note}”</div> : null}
      {photoUrl ? <img className="hero-photo" src={photoUrl} alt="Tuvaletten kare" /> : null}
    </div>
  );
}
