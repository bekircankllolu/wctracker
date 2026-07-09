import type { Member } from "../members";
import type { Visit } from "../lib/useVisits";
import Avatar from "./Avatar";

type Props = {
  name: string;
  member: Member | undefined;
  visits: Visit[];
  onClose: () => void;
};

const DAY_LABELS = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} sn`;
  return `${m} dk ${s} sn`;
}

export default function MemberDetail({ name, member, visits, onClose }: Props) {
  const mine = visits.filter((v) => v.member_name === name);
  const count = mine.length;
  const total = mine.reduce((a, v) => a + v.duration_seconds, 0);
  const avg = count ? Math.round(total / count) : 0;
  const durations = mine.map((v) => v.duration_seconds);
  const longest = durations.length ? Math.max(...durations) : 0;
  const shortest = durations.length ? Math.min(...durations) : 0;

  // Son 7 gün: her güne düşen ziyaret sayısı (bugün en sağda).
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const c = mine.filter((v) => {
      const t = new Date(v.created_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    days.push({ label: DAY_LABELS[d.getDay()], count: c });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const recent = [...mine]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Kişi detayı</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>

        <div className="md-hero">
          <Avatar emoji={member?.emoji ?? "🙂"} color={member?.color ?? "#f2711c"} avatarUrl={member?.avatar_url ?? null} size={64} />
          <div className="md-hero-text">
            <strong>{name}</strong>
            <small>{count} ziyaret · toplam {fmt(total)}</small>
          </div>
        </div>

        {count === 0 ? (
          <div className="md-empty">Henüz ziyaret kaydı yok 🤷</div>
        ) : (
          <>
            <div className="md-stats">
              <div className="md-stat"><span className="md-val">{fmt(avg)}</span><span className="md-label">Ortalama</span></div>
              <div className="md-stat"><span className="md-val">{fmt(longest)}</span><span className="md-label">En uzun</span></div>
              <div className="md-stat"><span className="md-val">{fmt(shortest)}</span><span className="md-label">En kısa</span></div>
            </div>

            <div className="md-section-label">Son 7 gün</div>
            <div className="md-chart">
              {days.map((d, i) => (
                <div className="md-bar-col" key={i}>
                  <div className="md-bar-track">
                    <div
                      className={`md-bar ${d.count > 0 ? "on" : ""}`}
                      style={{ height: `${(d.count / maxDay) * 100}%` }}
                    >
                      {d.count > 0 ? <span className="md-bar-count">{d.count}</span> : null}
                    </div>
                  </div>
                  <span className="md-bar-label">{d.label}</span>
                </div>
              ))}
            </div>

            <div className="md-section-label">Son ziyaretler</div>
            <ul className="md-recent">
              {recent.map((v) => (
                <li key={v.id}>
                  <span className="md-recent-date">
                    {new Date(v.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="md-recent-dur">{fmt(v.duration_seconds)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
