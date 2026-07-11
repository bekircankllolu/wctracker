import type { ReactNode } from "react";

type Props = {
  title: string;
  onMenu?: () => void;
  right?: ReactNode;
};

export default function TopBar({ title, onMenu, right }: Props) {
  return (
    <header className="topbar">
      <span className="tb-title">{title}</span>
      <div className="tb-right">
        {onMenu ? (
          <button className="tb-icon-btn" onClick={onMenu} aria-label="Menü">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <path d="M4 8h16M4 16h10" />
            </svg>
          </button>
        ) : null}
        {right}
      </div>
    </header>
  );
}
