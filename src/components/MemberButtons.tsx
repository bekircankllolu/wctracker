import { MEMBERS } from "../members";

type Props = {
  disabled: boolean;
  onEnter: (name: string) => void;
};

export default function MemberButtons({ disabled, onEnter }: Props) {
  return (
    <div className="members">
      <div className="members-title">Kim girdi?</div>
      <div className="members-grid">
        {MEMBERS.map((m) => (
          <button
            key={m.name}
            className="member-btn"
            style={{ ["--member-color" as string]: m.color }}
            disabled={disabled}
            onClick={() => onEnter(m.name)}
          >
            <span className="member-emoji" aria-hidden>
              {m.emoji}
            </span>
            <span className="member-name">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
