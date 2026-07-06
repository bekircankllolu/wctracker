import Avatar from "./Avatar";

type Props = {
  seconds: number;
  name: string;
  emoji: string;
  color: string;
  avatarUrl: string | null;
};

const pad = (n: number) => n.toString().padStart(2, "0");
function clock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const CX = 120, CY = 120, R_IN = 88, R_OUT = 104, TICKS = 60;

export default function RadialTimer({ seconds, name, emoji, color, avatarUrl }: Props) {
  const active = seconds % 60;
  return (
    <div className="dial">
      <svg viewBox="0 0 240 240" className="dial-svg" aria-hidden>
        {Array.from({ length: TICKS }).map((_, i) => {
          const a = (-90 + i * 6) * (Math.PI / 180);
          const on = i <= active;
          return (
            <line
              key={i}
              x1={CX + R_IN * Math.cos(a)} y1={CY + R_IN * Math.sin(a)}
              x2={CX + R_OUT * Math.cos(a)} y2={CY + R_OUT * Math.sin(a)}
              stroke={on ? "var(--orange)" : "var(--line)"}
              strokeWidth={3.2} strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="dial-center">
        <span className="dial-ava"><Avatar emoji={emoji} color={color} avatarUrl={avatarUrl} size={72} /></span>
        <span className="dial-name">{name} içeride</span>
        <span className="dial-time">{clock(seconds)}</span>
        <span className="dial-sub">şu kadar süredir 🚽</span>
      </div>
    </div>
  );
}
