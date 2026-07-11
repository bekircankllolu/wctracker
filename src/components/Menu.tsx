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

const THEMES: { key: ThemeChoice; label: string; icon: string }[] = [
  { key: "system", label: "Sistem", icon: "🖥️" },
  { key: "light", label: "Açık", icon: "☀️" },
  { key: "dark", label: "Koyu", icon: "🌙" },
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

        <div className="menu-section-label">Görünüm</div>
        <div className="theme-seg" role="group" aria-label="Tema">
          {THEMES.map((t) => (
            <button
              key={t.key}
              className={`theme-opt ${theme === t.key ? "on" : ""}`}
              onClick={() => onTheme(t.key)}
              aria-pressed={theme === t.key}
            >
              <span className="theme-ico" aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="menu-section-label">Bildirimler</div>
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
          <div className="menu-note">Bu cihaz/tarayıcı push bildirimini desteklemiyor.</div>
        )}

        <div className="menu-section-label">Kim</div>
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

        <div className="menu-section-label">Aile</div>
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

        <p className="menu-foot">WC Tracker · aile tuvalet takip</p>
      </div>
    </div>
  );
}
