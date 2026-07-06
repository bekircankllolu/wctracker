import { useState } from "react";
import { COLOR_OPTIONS, EMOJI_OPTIONS, type Member } from "../members";

type Props = {
  members: Member[];
  onClose: () => void;
  onAdd: (name: string, emoji: string, color: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<Member, "name" | "emoji" | "color">>) => void;
  onRemove: (id: string) => void;
};

type Draft = { id: string | null; name: string; emoji: string; color: string };

const EMPTY: Draft = { id: null, name: "", emoji: EMOJI_OPTIONS[0], color: COLOR_OPTIONS[0] };

export default function RosterEditor({ members, onClose, onAdd, onUpdate, onRemove }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);

  function startAdd() {
    setDraft({ ...EMPTY });
  }
  function startEdit(m: Member) {
    setDraft({ id: m.id, name: m.name, emoji: m.emoji, color: m.color });
  }
  function save() {
    if (!draft || !draft.name.trim()) return;
    if (draft.id) onUpdate(draft.id, { name: draft.name, emoji: draft.emoji, color: draft.color });
    else onAdd(draft.name, draft.emoji, draft.color);
    setDraft(null);
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Kadro</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <ul className="roster-list">
          {members.map((m) => (
            <li key={m.id} className="roster-row">
              <span className="roster-avatar" style={{ background: m.color }}>{m.emoji}</span>
              <span className="roster-name">{m.name}</span>
              <button className="roster-edit" onClick={() => startEdit(m)} aria-label="Düzenle">✏️</button>
              <button className="roster-del" onClick={() => onRemove(m.id)} aria-label="Sil">🗑️</button>
            </li>
          ))}
          {members.length === 0 ? <li className="roster-empty">Henüz kimse yok.</li> : null}
        </ul>

        {draft ? (
          <div className="roster-form">
            <input
              className="roster-input"
              autoFocus
              value={draft.name}
              maxLength={20}
              placeholder="İsim"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
            <div className="picker-label">Emoji</div>
            <div className="emoji-picker">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  className={`emoji-opt ${draft.emoji === em ? "sel" : ""}`}
                  onClick={() => setDraft({ ...draft, emoji: em })}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="picker-label">Renk</div>
            <div className="color-picker">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  className={`color-opt ${draft.color === c ? "sel" : ""}`}
                  style={{ background: c }}
                  onClick={() => setDraft({ ...draft, color: c })}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="roster-form-actions">
              <button className="btn-ghost" onClick={() => setDraft(null)}>Vazgeç</button>
              <button className="btn-primary" disabled={!draft.name.trim()} onClick={save}>
                {draft.id ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-primary add-person" onClick={startAdd}>＋ Kişi ekle</button>
        )}
      </div>
    </div>
  );
}
