export type AppIconName =
  | "calendar"
  | "chat"
  | "home"
  | "leaderboard"
  | "location"
  | "medal"
  | "menu"
  | "paper-empty"
  | "paper-full"
  | "paper-low"
  | "paper-medium"
  | "smell-awful"
  | "smell-bad"
  | "smell-fresh"
  | "smell-good"
  | "toilet"
  | "trophy"
  | "user";

type Props = {
  name: AppIconName;
  alt?: string;
  className?: string;
};

export default function AppIcon({ name, alt = "", className = "" }: Props) {
  return (
    <img
      className={`app-icon ${className}`.trim()}
      src={`/icons/${name}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      decoding="async"
      draggable={false}
    />
  );
}
