import { useRef, useState } from "react";
import { uploadImage } from "../lib/uploadImage";

type Props = {
  hasPhoto: boolean;
  onUploaded: (url: string | null) => void;
};

export default function PhotoButton({ hasPhoto, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosya tekrar seçilebilsin
    if (!file) return;
    setBusy(true);
    const url = await uploadImage(file);
    if (url) onUploaded(url);
    setBusy(false);
  }

  return (
    <div className="photo-actions">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
      <button
        className="photo-btn"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Yükleniyor…" : hasPhoto ? "📷 Fotoğrafı değiştir" : "📷 Fotoğraf ekle"}
      </button>
      {hasPhoto ? (
        <button className="photo-remove" onClick={() => onUploaded(null)}>
          Kaldır
        </button>
      ) : null}
    </div>
  );
}
