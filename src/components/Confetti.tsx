// Basit, bağımlılıksız konfeti — rekor kırılınca kısa bir kutlama.
const PIECES = Array.from({ length: 28 });
const COLORS = ["#f2711c", "#3f9e56", "#8b5cf6", "#ec4899", "#f6c445", "#3b82f6"];

export default function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {PIECES.map((_, i) => {
        const left = Math.round((i / PIECES.length) * 100 + (i % 3) * 3);
        const style = {
          left: `${left}%`,
          background: COLORS[i % COLORS.length],
          animationDelay: `${(i % 7) * 0.09}s`,
          animationDuration: `${1.8 + (i % 5) * 0.25}s`,
        } as const;
        return <span key={i} className="confetti-piece" style={style} />;
      })}
    </div>
  );
}
