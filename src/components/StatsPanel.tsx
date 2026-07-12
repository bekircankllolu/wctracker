import { useMemo, useState } from "react";
import type { Stats, Visit } from "../lib/useVisits";
import type { Member } from "../members";
import { fmtDuration } from "../lib/format";
import AppIcon from "./AppIcon";
import Avatar from "./Avatar";
import MemberDetail from "./MemberDetail";

type Props = { stats: Stats; statsToday: Stats; statsWeek: Stats; members: Member[]; visits: Visit[] };

export default function StatsPanel({ stats, statsToday, statsWeek, members, visits }: Props) {
  const [tab, setTab] = useState<"today" | "week" | "all">("today");
  const [selected, setSelected] = useState<string | null>(null);
  const s = tab === "today" ? statsToday : tab === "week" ? statsWeek : stats;
  const memberMap = useMemo(() => new Map(members.map((member) => [member.name, member])), [members]);
  const memberOf = (name: string) => memberMap.get(name);
  const top = s.perMember.slice(0, 3);
  const totalSeconds = s.perMember.reduce((sum, member) => sum + member.totalSeconds, 0);
  const average = s.totalVisits ? Math.round(totalSeconds / s.totalVisits) : 0;

  return (
    <>
      <div className="seg" role="group" aria-label="İstatistik dönemi">
        <button className={`seg-btn ${tab === "today" ? "on" : ""}`} onClick={() => setTab("today")} aria-pressed={tab === "today"}>Bugün</button>
        <button className={`seg-btn ${tab === "week" ? "on" : ""}`} onClick={() => setTab("week")} aria-pressed={tab === "week"}>Bu hafta</button>
        <button className={`seg-btn ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")} aria-pressed={tab === "all"}>Tümü</button>
      </div>

      {s.totalVisits === 0 ? (
        <div className="tile empty-card">Bu dönemde henüz ziyaret yok.</div>
      ) : (
        <div className="stats-content">
          <div className="stats-overview">
            <div><strong>{s.totalVisits}</strong><span>Ziyaret</span></div>
            <div><strong>{fmtDuration(totalSeconds)}</strong><span>Toplam</span></div>
            <div><strong>{fmtDuration(average)}</strong><span>Ortalama</span></div>
          </div>

          <div className="lb-grid">
            {top.map((m, i) => {
              const mem = memberOf(m.name);
              return (
                <button className={`lb-card ${i === 0 ? "first" : ""}`} key={m.name} onClick={() => setSelected(m.name)}>
                  <span className="lb-card-rank">{i + 1}</span>
                  <span className="plain-avatar" style={{ width: 44, height: 44 }}>
                    {mem?.avatar_url ? (
                      <Avatar emoji={mem.emoji} color={mem.color} avatarUrl={mem.avatar_url} size={44} />
                    ) : (
                      <span aria-hidden style={{ fontSize: 21 }}>{mem?.emoji ?? "🙂"}</span>
                    )}
                  </span>
                  <span className="lb-card-name">{m.name}</span>
                  <span className="lb-card-count">{m.count} kez</span>
                </button>
              );
            })}
          </div>

          {s.longestStay ? (
            <div className="lb-item record">
              <span className="rec-emoji" aria-hidden><AppIcon name="medal" /></span>
              <span className="rec-text">
                <span className="rec-label">Rekor — en uzun ziyaret</span>
                <strong className="rec-name">{s.longestStay.name}</strong>
              </span>
              <span className="rec-val">{fmtDuration(s.longestStay.value)}</span>
            </div>
          ) : null}
        </div>
      )}

      {selected ? (
        <MemberDetail
          name={selected}
          member={memberOf(selected)}
          visits={visits}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}
