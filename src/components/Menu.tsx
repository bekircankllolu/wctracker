import type { ThemeChoice } from "../lib/useTheme";
import type { Member } from "../members";
import AppIcon from "./AppIcon";
import Avatar from "./Avatar";

type Props = {
  theme: ThemeChoice;
  onTheme: (choice: ThemeChoice) => void;
  me: Member | undefined;
  memberCount: number;
  push: { supported: boolean; enabled: boolean; busy: boolean };
  onTogglePush: () => void;
  onManageRoster: () => void;
  onPickIdentity: () => void;
  onClose: () => void;
};

const THEMES: { key: ThemeChoice; label: string }[] = [
  { key: "light", label: "AÇIK" },
  { key: "dark", label: "KOYU" },
  { key: "system", label: "SİSTEM" },
];

export default function Menu({
  theme, onTheme, me, memberCount, push, onTogglePush, onManageRoster, onPickIdentity, onClose,
}: Props) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Menü</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <div className="menu-setting">
          <div className="menu-setting-copy">
            <strong>Görünüm</strong>
            <small>Uygulama teması</small>
          </div>
          <div className="theme-toggle" role="group" aria-label="Tema">
            {THEMES.map((t) => (
              <button
                key={t.key}
                className={`theme-toggle-btn ${theme === t.key ? "on" : ""}`}
                onClick={() => onTheme(t.key)}
                aria-pressed={theme === t.key}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {push.supported ? (
          <button className="menu-row" onClick={onTogglePush} disabled={push.busy}>
            <span className="menu-row-left">
              <span className="menu-row-emoji" aria-hidden>{push.enabled ? "🔔" : "🔕"}</span>
              <span className="menu-row-text">
                <strong>{push.enabled ? "Bildirimler açık" : "Bildirimleri aç"}</strong>
                <small>{push.enabled ? "Boşalınca / sıra sana gelince haber ver" : "Uygulama kapalıyken bile haber al"}</small>
              </span>
            </span>
            <span className={`push-switch ${push.enabled ? "on" : ""}`} aria-hidden><span /></span>
          </button>
        ) : (
          <div className="menu-note">
            <svg className="menu-note-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 7.5v.5" />
            </svg>
            <span>Bu cihaz/tarayıcı push bildirimini desteklemiyor.</span>
          </div>
        )}

        <button className="menu-row" onClick={() => { onClose(); onPickIdentity(); }}>
          <span className="menu-row-left">
            {me ? (
              <Avatar emoji={me.emoji} color={me.color} avatarUrl={me.avatar_url} size={36} />
            ) : (
              <span className="menu-row-emoji" aria-hidden><AppIcon name="user" /></span>
            )}
            <span className="menu-row-text">
              <strong>{me ? me.name : "Ben kimim?"}</strong>
              <small>{me ? "Bu cihazdaki kimlik" : "Sohbet için bir kimlik seç"}</small>
            </span>
          </span>
          <span className="menu-row-arrow" aria-hidden>›</span>
        </button>

        <button className="menu-row" onClick={() => { onClose(); onManageRoster(); }}>
          <span className="menu-row-left">
            <span className="menu-row-emoji" aria-hidden>👨‍👩‍👧‍👦</span>
            <span className="menu-row-text">
              <strong>Kadroyu düzenle</strong>
              <small>{memberCount} kişi · ekle, düzenle, çıkar</small>
            </span>
          </span>
          <span className="menu-row-arrow" aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}
