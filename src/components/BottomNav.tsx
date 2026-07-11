import AppIcon, { type AppIconName } from "./AppIcon";

export type Tab = "durum" | "sohbet" | "takvim";

const ICONS: Record<Tab, AppIconName> = { durum: "home", sohbet: "chat", takvim: "calendar" };

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
          <span className="nav-icon"><AppIcon name={ICONS[t]} /></span>
          <span className="nav-label">{LABELS[t]}</span>
        </button>
      ))}
    </nav>
  );
}
