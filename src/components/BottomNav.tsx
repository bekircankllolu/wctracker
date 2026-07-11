export type Tab = "durum" | "sohbet" | "takvim";

const ICONS: Record<Tab, JSX.Element> = {
  durum: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  ),
  sohbet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5h16v11H9l-4 3.5v-3.5H4Z" />
      <path d="M8.5 10.5h7M8.5 13h4" />
    </svg>
  ),
  takvim: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  ),
};

const LABELS: Record<Tab, string> = { durum: "Durum", sohbet: "Sohbet", takvim: "Takvim" };
// Aktif sekmede pastel renk: Durum=peach, Sohbet=lavender, Takvim=butter.
const TAB_TONE: Record<Tab, string> = { durum: "peach", sohbet: "lavender", takvim: "butter" };
const ORDER: Tab[] = ["durum", "sohbet", "takvim"];

type Props = { active: Tab; onChange: (t: Tab) => void };

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {ORDER.map((t) => (
        <button
          key={t}
          className={`nav-item ${active === t ? `on ${TAB_TONE[t]}` : ""}`}
          onClick={() => onChange(t)}
        >
          <span className="nav-icon">{ICONS[t]}</span>
          <span className="nav-label">{LABELS[t]}</span>
        </button>
      ))}
    </nav>
  );
}
