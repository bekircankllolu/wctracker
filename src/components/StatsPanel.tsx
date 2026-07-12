import { useState } from "react";
import type { Stats, Visit } from "../lib/useVisits";
import type { Member } from "../members";
import { fmtDuration } from "../lib/format";
import AppIcon from "./AppIcon";
import Avatar from "./Avatar";
import MemberDetail from "./MemberDetail";

type Props = { stats: Stats; statsWeek: Stats; members: Member[]; visits: Visit[] };

export default function StatsPanel({ stats, statsWeek, members, visits }: Props) {
  const [tab, setTab] = useState<"week" | "all">("week");
  const [selected, setSelected] = useState<string | null>(null);
  const s = tab === "week" ? statsWeek : stats;
  const memberOf = (n: string) => members.find((m) => m.name === n);
  const top = s.perMember.slice(0, 3);

  return (
    <>
      <div className="seg">
        <button className={`seg-btn ${tab === "week" ? "on" : ""}`} onClick={() => setTab("week")}>Bu hafta</button>
        <button className={`seg-btn ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>Tüm zamanlar</button>
      </div>

      {s.totalVisits === 0 ? (
        <div className="tile empty-card">Bu dönemde veri yok — ilk giren efsane olur 😄</div>
      ) : (
        <div className="lb-list">
          {top.map((m, i) => {
            const mem = memberOf(m.name);
            return (
              <button className={`lb-item tappable ${i === 0 ? "first" : ""}`} key={m.name} onClick={() => setSelected(m.name)}>
                <span className="lb-rank">{i + 1}</span>
                <span className="lb-name">{m.name}</span>
                <span className="lb-pill">{m.count} kez</span>
                <span className="plain-avatar" style={{ width: 40, height: 40 }}>
                  {mem?.avatar_url ? (
                    <Avatar emoji={mem?.emoji ?? "🙂"} color={mem?.color ?? "#f2711c"} avatarUrl={mem?.avatar_url} size={40} />
                  ) : (
                    <span aria-hidden style={{ fontSize: 20 }}>{mem?.emoji ?? "🙂"}</span>
                  )}
                </span>
              </button>
            );
          })}

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
