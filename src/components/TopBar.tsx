import type { ReactNode } from "react";
import AppIcon from "./AppIcon";

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
            <AppIcon name="menu" />
          </button>
        ) : null}
        {right}
      </div>
    </header>
  );
}
