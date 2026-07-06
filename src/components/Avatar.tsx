type Props = {
  emoji: string;
  color: string;
  avatarUrl?: string | null;
  size?: number;
  shape?: "circle" | "rounded";
};

// Fotoğraf varsa gerçek profil fotoğrafını, yoksa renkli zeminde emoji gösterir.
export default function Avatar({
  emoji,
  color,
  avatarUrl,
  size = 48,
  shape = "circle",
}: Props) {
  const radius = shape === "circle" ? "50%" : "26px";
  const style = { width: size, height: size, borderRadius: radius } as const;

  if (avatarUrl) {
    return <img className="avatar-img" style={style} src={avatarUrl} alt="" />;
  }
  return (
    <span
      className="avatar-fallback"
      style={{
        ...style,
        background: `color-mix(in srgb, ${color} 18%, var(--card-2))`,
        fontSize: size * 0.5,
      }}
    >
      {emoji}
    </span>
  );
}
