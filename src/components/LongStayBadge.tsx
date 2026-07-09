import { useElapsed } from "../lib/timers";

// İçeride geçen süre eşikleri aştıkça kademeli, esprili uyarı gösterir.
// Kendi tik'ini yaptığı için App'i her saniye render etmez.
const LEVELS = [
  { min: 1200, cls: "danger", text: "🚨 20 dakika oldu, iyi misin oradaki? 😱" },
  { min: 900, cls: "warn", text: "😅 15 dakikadır içeride! Kitap mı okuyoruz?" },
  { min: 600, cls: "warn", text: "⏳ 10 dakikayı geçti, acele yok ama…" },
];

export default function LongStayBadge({ enteredAt }: { enteredAt: string | null }) {
  const sec = useElapsed(enteredAt);
  const level = LEVELS.find((l) => sec >= l.min);
  if (!level) return null;
  return <div className={`longstay ${level.cls}`}>{level.text}</div>;
}
