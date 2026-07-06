const pad = (n: number) => n.toString().padStart(2, "0");
const mmss = (sec: number) => `${Math.floor(sec / 60)}:${pad(sec % 60)}`;

type Props = { occupant: string | null; elapsedSec: number };

export default function StatusBanner({ occupant, elapsedSec }: Props) {
  return (
    <div className="occ-banner">
      <span className="occ-banner-left">
        <span className="occ-banner-icon" aria-hidden>🚽</span>
        <strong>{occupant}</strong> tuvalette
      </span>
      <span className="occ-banner-time">{mmss(elapsedSec)}</span>
    </div>
  );
}
