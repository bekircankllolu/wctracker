import type { Member } from "../members";
import Avatar from "./Avatar";

type Props = {
  members: Member[];
  identity: string | null;
  onPick: (name: string | null) => void;
  onClose: () => void;
};

export default function IdentityPicker({ members, identity, onPick, onClose }: Props) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Ben kimim?</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>
        <p className="sheet-hint">Sohbet ve dürtmede bu isimle görünürsün.</p>

        <div className="identity-grid">
          {members.map((m) => (
            <button
              key={m.id}
              className={`identity-opt ${identity === m.name ? "sel" : ""}`}
              style={{ ["--member-color" as string]: m.color }}
              onClick={() => {
                onPick(m.name);
                onClose();
              }}
            >
              <Avatar emoji={m.emoji} color={m.color} avatarUrl={m.avatar_url} size={50} />
              <span>{m.name}</span>
            </button>
          ))}
        </div>

        {identity ? (
          <button className="btn-ghost identity-clear" onClick={() => { onPick(null); onClose(); }}>
            Kimliği temizle
          </button>
        ) : null}
      </div>
    </div>
  );
}
