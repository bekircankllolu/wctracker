import type { ReactNode } from "react";

type Props = {
  icon: string;
  title: string;
  right?: ReactNode;
  onMenu: () => void;
};

export default function TopBar({ icon, title, right, onMenu }: Props) {
  return (
    <header className="topbar">
      <button className="tb-menu" onClick={onMenu} aria-label="Menü">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div className="tb-title">
        <span className="tb-icon" aria-hidden>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="tb-right">{right}</div>
    </header>
  );
}
