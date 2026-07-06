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

const CX = 120;
const CY = 120;
const R_IN = 86;
const R_OUT = 102;
const R_KNOB = 94;
const TICKS = 60;

export default function RadialTimer({ seconds, name, emoji, color, avatarUrl }: Props) {
  const active = seconds % 60; // her dakika bir tur döner
  const knobAngle = (-90 + active * 6) * (Math.PI / 180);
  const knobX = CX + R_KNOB * Math.cos(knobAngle);
  const knobY = CY + R_KNOB * Math.sin(knobAngle);

  return (
    <div className="dial">
      <svg viewBox="0 0 240 240" className="dial-svg" aria-hidden>
        {Array.from({ length: TICKS }).map((_, i) => {
          const a = (-90 + i * 6) * (Math.PI / 180);
          const on = i <= active;
          return (
            <line
              key={i}
              x1={CX + R_IN * Math.cos(a)}
              y1={CY + R_IN * Math.sin(a)}
              x2={CX + R_OUT * Math.cos(a)}
              y2={CY + R_OUT * Math.sin(a)}
              stroke={on ? "var(--teal)" : "var(--teal-soft)"}
              strokeWidth={3.4}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="dial-center">
        <div className="dial-label">{name} içeride</div>
        <div className="dial-time">{clock(seconds)}</div>
        <div className="dial-sub">şu kadar süredir 🚽</div>
      </div>

      <div
        className="dial-knob"
        style={{ left: `${(knobX / 240) * 100}%`, top: `${(knobY / 240) * 100}%` }}
      >
        <Avatar emoji={emoji} color={color} avatarUrl={avatarUrl} size={44} />
      </div>
    </div>
  );
}
