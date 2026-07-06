import type { Stats } from "../lib/useVisits";
import type { Member } from "../members";
import Avatar from "./Avatar";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}sn`;
  return `${m}dk ${s}sn`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

type Props = { stats: Stats; members: Member[] };

export default function StatsPanel({ stats, members }: Props) {
  const memberOf = (name: string) => members.find((m) => m.name === name);
  const top = stats.perMember.slice(0, 3);

  return (
    <section className="panel lig-panel">
      <div className="panel-head">
        <div>
          <h2 className="panel-h">Tuvalet Ligi 🏆</h2>
          <p className="panel-p">Kim ne kadar giriyor?</p>
        </div>
        <span className="pill-count">{stats.totalVisits} ziyaret</span>
      </div>

      {stats.totalVisits === 0 ? (
        <div className="stats-empty">Henüz veri yok — ilk giren efsane olur 😄</div>
      ) : (
        <>
          <div className="lig">
            {top.map((m, i) => {
              const mem = memberOf(m.name);
              return (
                <div className={`lig-row rank-${i + 1}`} key={m.name}>
                  <span className="lig-rank">{MEDALS[i]} #{i + 1}</span>
                  <span className="lig-name">{m.name}</span>
                  <span className="lig-count">{m.count} kez</span>
                  <span className="lig-avatar">
                    <Avatar
                      emoji={mem?.emoji ?? "🙂"}
                      color={mem?.color ?? "#ec6a80"}
                      avatarUrl={mem?.avatar_url}
                      size={40}
                    />
                  </span>
                </div>
              );
            })}
          </div>

          <div className="lig-foot">
            {stats.longestStay ? (
              <span>⏳ En uzun: <strong>{stats.longestStay.name}</strong> ({fmtDuration(stats.longestStay.value)})</span>
            ) : null}
            {stats.mostTotalTime ? (
              <span>📊 Toplam lider: <strong>{stats.mostTotalTime.name}</strong> ({fmtDuration(stats.mostTotalTime.value)})</span>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
