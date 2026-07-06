import type { Phase } from "../lib/useWcState";

const pad = (n: number) => n.toString().padStart(2, "0");
function mmss(sec: number) {
  return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
}

type Props = { phase: Phase; occupant: string | null; elapsedSec: number; cooldownMs: number };

export default function StatusBanner({ phase, occupant, elapsedSec, cooldownMs }: Props) {
  if (phase === "occupied") {
    return (
      <div className="banner occupied">
        <span className="banner-dot" />
        <span className="banner-text"><strong>{occupant}</strong> tuvalette</span>
        <span className="banner-time">{mmss(elapsedSec)}</span>
      </div>
    );
  }
  if (phase === "cooldown") {
    return (
      <div className="banner cooldown">
        <span className="banner-dot" />
        <span className="banner-text">💨 Havalandırılıyor</span>
        <span className="banner-time">{mmss(Math.ceil(cooldownMs / 1000))}</span>
      </div>
    );
  }
  return (
    <div className="banner free">
      <span className="banner-dot" />
      <span className="banner-text">Tuvalet müsait 🟢</span>
    </div>
  );
}
