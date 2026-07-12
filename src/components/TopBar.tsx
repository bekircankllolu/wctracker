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
            <span className="menu-glyph" aria-hidden="true">
              <span className="menu-glyph-line" />
              <span className="menu-glyph-line" />
              <span className="menu-glyph-line" />
              <span className="menu-glyph-dot" />
            </span>
          </button>
        ) : null}
        {right}
      </div>
    </header>
  );
}
