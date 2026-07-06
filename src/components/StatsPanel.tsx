import { useState } from "react";
import type { Stats } from "../lib/useVisits";
import type { Member } from "../members";
import Avatar from "./Avatar";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} sn`;
  return `${m} dk ${s} sn`;
}

type Props = { stats: Stats; statsWeek: Stats; members: Member[] };

export default function StatsPanel({ stats, statsWeek, members }: Props) {
  const [tab, setTab] = useState<"week" | "all">("all");
  const s = tab === "week" ? statsWeek : stats;
  const memberOf = (name: string) => members.find((m) => m.name === name);
  const top = s.perMember.slice(0, 3);

  return (
    <section className="lb">
      <div className="lb-head">
        <h2 className="lb-title">Sıralama 🏆</h2>
        <span className="lb-count">{s.totalVisits} ziyaret</span>
      </div>

      <div className="lb-tabs">
        <button className={`lb-tab ${tab === "week" ? "on" : ""}`} onClick={() => setTab("week")}>
          Bu hafta
        </button>
        <button className={`lb-tab ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>
          Tüm zamanlar
        </button>
      </div>

      {s.totalVisits === 0 ? (
        <div className="lb-empty">Bu dönemde veri yok — ilk giren efsane olur 😄</div>
      ) : (
        <>
          <div className="lb-rows">
            {top.map((m, i) => {
              const mem = memberOf(m.name);
              return (
                <div className={`lb-row rank-${i + 1}`} key={m.name}>
                  <span className="lb-badge">🏆 #{i + 1}</span>
                  <span className="lb-name">{m.name}</span>
                  <span className="lb-pill">{m.count} kez</span>
                  <span className="lb-ava">
                    <Avatar
                      emoji={mem?.emoji ?? "🙂"}
                      color={mem?.color ?? "#e8637a"}
                      avatarUrl={mem?.avatar_url}
                      size={40}
                    />
                  </span>
                </div>
              );
            })}
          </div>

          {s.longestStay ? (
            <div className="lb-record">
              <div className="lb-record-inner">
                <span className="lb-record-emoji" aria-hidden>⏳</span>
                <div className="lb-record-text">
                  <span className="lb-record-label">Rekor — en uzun ziyaret</span>
                  <strong className="lb-record-name">{s.longestStay.name}</strong>
                </div>
                <span className="lb-record-val">{fmtDuration(s.longestStay.value)}</span>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
