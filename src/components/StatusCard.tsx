import { useEffect, useState } from "react";
import Avatar from "./Avatar";

type Props = {
  occupant: string | null;
  enteredAt: string | null;
  note: string | null;
  photoUrl: string | null;
  emoji: string;
  color: string;
  avatarUrl: string | null;
  poked: boolean;
};

const pad = (n: number) => n.toString().padStart(2, "0");

function clock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function StatusCard({
  occupant,
  enteredAt,
  note,
  photoUrl,
  emoji,
  color,
  avatarUrl,
  poked,
}: Props) {
  const [now, setNow] = useState(() => Date.now());
  const occupied = Boolean(occupant);

  useEffect(() => {
    if (!occupied) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [occupied]);

  if (!occupied) {
    return (
      <div className="status-hero free">
        <div className="hero-emoji-wrap">
          <span className="hero-emoji" aria-hidden>🚽</span>
        </div>
        <div className="hero-title">MÜSAİT</div>
        <div className="hero-sub">Tuvalet boş, buyurun 🙌</div>
      </div>
    );
  }

  const elapsedSec = enteredAt
    ? Math.max(0, Math.floor((now - new Date(enteredAt).getTime()) / 1000))
    : 0;
  const ringAngle = ((elapsedSec % 60) / 60) * 360;

  return (
    <div className={`status-hero occupied ${poked ? "poked" : ""}`}>
      <div
        className="hero-avatar-ring"
        style={{
          background: `conic-gradient(var(--cream) ${ringAngle}deg, rgba(255,255,255,0.28) 0)`,
        }}
      >
        <div className="hero-avatar-inner">
          <Avatar emoji={emoji} color={color} avatarUrl={avatarUrl} size={92} />
        </div>
      </div>

      <div className="hero-name">{occupant}</div>
      <div className="hero-clock" aria-live="polite">{clock(elapsedSec)}</div>
      <div className="hero-sub">şu kadar süredir tuvalette 🚽</div>

      {note ? <div className="hero-note">“{note}”</div> : null}
      {photoUrl ? <img className="hero-photo" src={photoUrl} alt="Tuvaletten kare" /> : null}
    </div>
  );
}
