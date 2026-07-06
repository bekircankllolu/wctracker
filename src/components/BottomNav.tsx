export type Tab = "durum" | "siralama" | "takvim";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "durum", icon: "🚽", label: "Durum" },
  { id: "siralama", icon: "🏆", label: "Sıralama" },
  { id: "takvim", icon: "📅", label: "Takvim" },
];

type Props = { active: Tab; onChange: (t: Tab) => void };

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-item ${active === t.id ? "on" : ""}`}
          onClick={() => onChange(t.id)}
        >
          <span className="nav-icon" aria-hidden>{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
