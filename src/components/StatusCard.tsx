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
const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

export default function StatusCard({
  phase, occupant, elapsedSec, note, photoUrl, emoji, color, avatarUrl, poked, cooldownMs, multiplier,
}: Props) {
  if (phase === "cooldown") {
    return (
      <div className="cd-card">
        <div className="cd-emoji" aria-hidden>💨</div>
        <div className="cd-title">Havalandırılıyor</div>
        <div className="cd-clock">{mmss(cooldownMs)}</div>
        <div className="cd-sub">Leş gibi kokuyor, biraz bekleyelim 🤢</div>
        {multiplier > 1 ? <div className="cd-mult">koku çarpanı ×{multiplier}</div> : null}
      </div>
    );
  }

  if (phase === "free") {
    return (
      <div className="free-hero">
        <div className="free-icon" aria-hidden>🚽</div>
        <div className="free-title">Müsait</div>
        <div className="free-sub">Tuvalet boş, buyurun 🙌</div>
      </div>
    );
  }

  return (
    <div className={`occ-wrap ${poked ? "poked" : ""}`}>
      <RadialTimer seconds={elapsedSec} name={occupant ?? ""} emoji={emoji} color={color} avatarUrl={avatarUrl} />
      {note ? <div className="note-pill">“{note}”</div> : null}
      {photoUrl ? <img className="occ-photo" src={photoUrl} alt="Tuvaletten kare" /> : null}
    </div>
  );
}
