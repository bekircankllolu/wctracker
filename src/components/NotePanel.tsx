import { useEffect, useState } from "react";

type Props = {
  note: string | null;
  onSave: (note: string) => void;
};

const NOTE_MAX = 80;
const PRESETS = ["💩 Büyük geldi", "💦 Küçük", "📱 Uzun sürebilir", "🚿 Duş alıyorum"];

export default function NotePanel({ note, onSave }: Props) {
  const [text, setText] = useState(note ?? "");

  // Dışarıdan (realtime) not değişirse alanı güncel tut.
  useEffect(() => {
    setText(note ?? "");
  }, [note]);

  const dirty = text.trim() !== (note ?? "").trim();

  return (
    <div className="tile note-panel">
      <div className="note-title">Not bırak ✏️</div>

      <div className="note-presets">
        {PRESETS.map((p) => (
          <button
            key={p}
            className={`note-chip ${note === p ? "on" : ""}`}
            onClick={() => onSave(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="note-input-row">
        <input
          className="note-input"
          value={text}
          maxLength={NOTE_MAX}
          placeholder="Kendin yaz…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && dirty) onSave(text);
          }}
        />
        <button className="note-save" disabled={!dirty} onClick={() => onSave(text)}>
          Kaydet
        </button>
      </div>
      {/* Sayaç dolarken renk değişir: yaklaşınca turuncu, sınırda kırmızı. */}
      <div className={`note-count ${text.length >= NOTE_MAX ? "full" : text.length >= NOTE_MAX * 0.85 ? "near" : ""}`}>
        {text.length}/{NOTE_MAX}
      </div>
    </div>
  );
}
