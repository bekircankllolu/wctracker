import { useEffect, useState } from "react";

type Props = {
  occupant: string | null;
  enteredAt: string | null;
  note: string | null;
  photoUrl: string | null;
  emoji: string;
  color: string;
  poked: boolean;
};

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} sn`;
  return `${min} dk ${sec.toString().padStart(2, "0")} sn`;
}

export default function StatusCard({
  occupant,
  enteredAt,
  note,
  photoUrl,
  emoji,
  color,
  poked,
}: Props) {
  const [now, setNow] = useState(() => Date.now());
  const occupied = Boolean(occupant);

  useEffect(() => {
    if (!occupied) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [occupied]);

  const duration =
    occupied && enteredAt ? formatDuration(now - new Date(enteredAt).getTime()) : null;

  return (
    <div
      className={`status-card ${occupied ? "occupied" : "free"} ${poked ? "poked" : ""}`}
      style={occupied ? ({ ["--accent" as string]: color }) : undefined}
    >
      <div className="status-doorframe">
        <div className="status-emoji" aria-hidden>
          {occupied ? emoji : "🚽"}
        </div>
      </div>

      <div className="status-label">{occupied ? "DOLU" : "MÜSAİT"}</div>

      {occupied ? (
        <>
          <div className="status-occupant">
            İçeride <strong>{occupant}</strong> var
          </div>
          <div className="status-timer">⏱️ {duration}</div>
          {note ? <div className="status-note">“{note}”</div> : null}
          {photoUrl ? (
            <img className="status-photo" src={photoUrl} alt="Tuvaletten kare" />
          ) : null}
        </>
      ) : (
        <div className="status-sub">Tuvalet boş, buyurun 🙌</div>
      )}
    </div>
  );
}
