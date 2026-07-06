import { useRef, useState } from "react";
import { supabase } from "../supabaseClient";

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
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await supabase.storage
      .from("wc-photos")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (!error) {
      const { data } = supabase.storage.from("wc-photos").getPublicUrl(path);
      onUploaded(data.publicUrl);
    }
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
