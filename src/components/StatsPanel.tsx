import type { Stats } from "../lib/useVisits";
import type { Member } from "../members";
import { colorForIndex } from "../theme";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}sn`;
  return `${m}dk ${s}sn`;
}

type Props = { stats: Stats; members: Member[] };

export default function StatsPanel({ stats, members }: Props) {
  const colorFor = (name: string, i: number) =>
    members.find((m) => m.name === name)?.color ?? colorForIndex(i);

  const bars = stats.perMember.slice(0, 5);
  const maxCount = Math.max(1, ...bars.map((b) => b.count));

  const tiles = [
    { icon: "🏆", label: "En çok giren", leader: stats.mostVisits, fmt: (v: number) => `${v} kez` },
    { icon: "⏳", label: "En uzun", leader: stats.longestStay, fmt: fmtDuration },
    { icon: "📊", label: "Toplam süre", leader: stats.mostTotalTime, fmt: fmtDuration },
  ];

  return (
    <section className="panel stats-panel">
      <div className="panel-head">
        <div>
          <h2 className="panel-h">Tuvalet Ligi</h2>
          <p className="panel-p">Kim ne kadar giriyor?</p>
        </div>
        <span className="pill-count">{stats.totalVisits} ziyaret</span>
      </div>

      {stats.totalVisits === 0 ? (
        <div className="stats-empty">Henüz veri yok — ilk giren efsane olur 😄</div>
      ) : (
        <>
          <div className="bars">
            {bars.map((b, i) => {
              const color = colorFor(b.name, i);
              return (
                <div className="bar-col" key={b.name}>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${(b.count / maxCount) * 100}%`, background: color }}
                    >
                      <span className="bar-value">{b.count}</span>
                    </div>
                  </div>
                  <span className="bar-label">{b.name}</span>
                </div>
              );
            })}
          </div>

          <div className="stat-tiles">
            {tiles.map((t) => (
              <div className="stat-tile" key={t.label}>
                <span className="tile-icon" aria-hidden>{t.icon}</span>
                <span className="tile-label">{t.label}</span>
                <span className="tile-name">{t.leader ? t.leader.name : "—"}</span>
                <span className="tile-value">{t.leader ? t.fmt(t.leader.value) : ""}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
