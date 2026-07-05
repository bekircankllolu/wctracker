import { useEffect, useState } from "react";
import { findMember } from "../members";

type Props = {
  occupant: string | null;
  enteredAt: string | null;
};

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} sn`;
  return `${min} dk ${sec.toString().padStart(2, "0")} sn`;
}

export default function StatusCard({ occupant, enteredAt }: Props) {
  const [now, setNow] = useState(() => Date.now());

  // İçeride biri varken sayacı her saniye ilerlet.
  useEffect(() => {
    if (!occupant) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [occupant]);

  const occupied = Boolean(occupant);
  const member = findMember(occupant);
  const duration =
    occupied && enteredAt ? formatDuration(now - new Date(enteredAt).getTime()) : null;

  return (
    <div className={`status-card ${occupied ? "occupied" : "free"}`}>
      <div className="status-emoji" aria-hidden>
        {occupied ? member?.emoji ?? "🚽" : "🚽"}
      </div>

      <div className="status-label">{occupied ? "DOLU" : "BOŞ"}</div>

      {occupied ? (
        <>
          <div className="status-occupant">
            İçeride: <strong>{occupant}</strong>
          </div>
          <div className="status-timer">{duration}</div>
        </>
      ) : (
        <div className="status-sub">Tuvalet müsait, buyurun 🙌</div>
      )}
    </div>
  );
}
