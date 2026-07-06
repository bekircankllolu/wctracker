import type { Member } from "../members";

type Props = {
  members: Member[];
  disabled: boolean;
  onEnter: (member: Member) => void;
  onManage: () => void;
};

export default function MemberGrid({ members, disabled, onEnter, onManage }: Props) {
  return (
    <div className="members">
      <div className="members-head">
        <span className="members-title">Kim girdi?</span>
        <button className="link-btn" onClick={onManage}>
          Kadroyu düzenle
        </button>
      </div>

      {members.length === 0 ? (
        <div className="members-empty">
          Henüz kimse yok. <button className="link-btn" onClick={onManage}>Kişi ekle</button>
        </div>
      ) : (
        <div className="members-grid">
          {members.map((m) => (
            <button
              key={m.id}
              className="member-btn"
              style={{ ["--member-color" as string]: m.color }}
              disabled={disabled}
              onClick={() => onEnter(m)}
            >
              <span className="member-emoji" aria-hidden>{m.emoji}</span>
              <span className="member-name">{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
