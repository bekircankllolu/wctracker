export type Tab = "durum" | "siralama" | "takvim";

const ICONS: Record<Tab, JSX.Element> = {
  durum: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  ),
  siralama: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
      <path d="M6 6H3.5a2.5 2.5 0 0 0 3 2.4M18 6h2.5a2.5 2.5 0 0 1-3 2.4" />
      <path d="M12 13v3M9 20h6M10 20l.5-4M14 20l-.5-4" />
    </svg>
  ),
  takvim: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  ),
};

const LABELS: Record<Tab, string> = { durum: "Durum", siralama: "Sıralama", takvim: "Takvim" };
const ORDER: Tab[] = ["durum", "siralama", "takvim"];

type Props = { active: Tab; onChange: (t: Tab) => void };

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {ORDER.map((t) => (
        <button key={t} className={`nav-item ${active === t ? "on" : ""}`} onClick={() => onChange(t)}>
          <span className="nav-icon">{ICONS[t]}</span>
          <span className="nav-label">{LABELS[t]}</span>
        </button>
      ))}
    </nav>
  );
}
