import { useEffect, useState } from "react";
import RadialTimer from "./RadialTimer";

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

  return (
    <div className={`status-hero occupied ${poked ? "poked" : ""}`}>
      <RadialTimer
        seconds={elapsedSec}
        name={occupant ?? ""}
        emoji={emoji}
        color={color}
        avatarUrl={avatarUrl}
      />
      {note ? <div className="hero-note">“{note}”</div> : null}
      {photoUrl ? <img className="hero-photo" src={photoUrl} alt="Tuvaletten kare" /> : null}
    </div>
  );
}
