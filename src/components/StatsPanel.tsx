import type { Stats, Leader } from "../lib/useVisits";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} sn`;
  return `${m} dk ${s} sn`;
}

type Row = { icon: string; label: string; leader: Leader; render: (v: number) => string };

export default function StatsPanel({ stats }: { stats: Stats }) {
  const rows: Row[] = [
    { icon: "🏆", label: "En çok giren", leader: stats.mostVisits, render: (v) => `${v} kez` },
    { icon: "⏳", label: "Tek seferde en uzun", leader: stats.longestStay, render: fmtDuration },
    { icon: "📊", label: "Toplam en çok süre", leader: stats.mostTotalTime, render: fmtDuration },
  ];

  return (
    <div className="panel stats-panel">
      <div className="panel-title">
        <span>🚽 Tuvalet Ligi</span>
        <span className="panel-sub">{stats.totalVisits} ziyaret</span>
      </div>

      {stats.totalVisits === 0 ? (
        <div className="stats-empty">Henüz veri yok — ilk giren efsane olur 😄</div>
      ) : (
        <ul className="stats-list">
          {rows.map((r) => (
            <li key={r.label} className="stats-row">
              <span className="stats-icon" aria-hidden>{r.icon}</span>
              <span className="stats-label">{r.label}</span>
              <span className="stats-value">
                {r.leader ? (
                  <>
                    <strong>{r.leader.name}</strong>
                    <em>{r.render(r.leader.value)}</em>
                  </>
                ) : (
                  "—"
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
