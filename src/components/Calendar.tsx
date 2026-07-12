import { useState } from "react";
import Avatar from "./Avatar";
import type { Member } from "../members";
import type { Visit } from "../lib/useVisits";
import { MAX_REASONABLE_STAY } from "../lib/format";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

type Props = { members: Member[]; visits: Visit[] };

export default function Calendar({ members, visits: allVisits }: Props) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const memberOf = (n: string) => members.find((m) => m.name === n);

  // Anormal (sayaç unutulmuş) oturumları takvim/şampiyon sayımına katma —
  // liderlik tablosuyla tutarlı kalsın.
  const visits = allVisits.filter((v) => v.duration_seconds <= MAX_REASONABLE_STAY);

  const byDay = new Map<string, Map<string, number>>();
  for (const v of visits) {
    const d = new Date(v.created_at);
    const k = key(d);
    const mm = byDay.get(k) ?? new Map();
    mm.set(v.member_name, (mm.get(v.member_name) ?? 0) + 1);
    byDay.set(k, mm);
  }
  const dayInfo = (d: Date) => {
    const mm = byDay.get(key(d));
    if (!mm) return null;
    let name = "", best = 0, total = 0;
    for (const [n, c] of mm) { total += c; if (c > best) { best = c; name = n; } }
    return { name, total };
  };

  // Bu haftanın şampiyonu (Pzt-Paz)
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today); monday.setHours(0, 0, 0, 0); monday.setDate(today.getDate() - dow);
  const wk = new Map<string, number>();
  for (const v of visits) if (new Date(v.created_at).getTime() >= monday.getTime()) wk.set(v.member_name, (wk.get(v.member_name) ?? 0) + 1);
  let champ: { name: string; count: number } | null = null;
  for (const [n, c] of wk) if (!champ || c > champ.count) champ = { name: n, count: c };

  const first = new Date(view.y, view.m, 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });

  const [dir, setDir] = useState<"prev" | "next">("next");
  const prev = () => { setDir("prev"); setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 })); };
  const next = () => { setDir("next"); setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })); };

  return (
    <>
      <div className="tile cal-panel">
        <div className="cal-nav">
          <button className="cal-arrow" onClick={prev} aria-label="Önceki">‹</button>
          <span className="cal-month">{MONTHS[view.m]} {view.y}</span>
          <button className="cal-arrow" onClick={next} aria-label="Sonraki">›</button>
        </div>
        <div className="cal-grid cal-dow">{DAYS.map((d) => <span key={d} className="cal-dowcell">{d}</span>)}</div>
        <div className={`cal-grid cal-slide ${dir}`} key={`${view.y}-${view.m}`}>
          {cells.map((d, i) => {
            const inMonth = d.getMonth() === view.m;
            const isToday = key(d) === key(today);
            const info = inMonth ? dayInfo(d) : null;
            const col = info ? memberOf(info.name)?.color ?? "#f2711c" : undefined;
            return (
              <span key={i} className={`cal-cell ${!inMonth ? "out" : ""} ${isToday ? "today" : ""}`}>
                <span className="cal-num">{d.getDate()}</span>
                {info ? <span className="cal-dot" style={{ background: col }} /> : null}
              </span>
            );
          })}
        </div>
        <p className="cal-legend"><span className="cal-legend-dot" /> Nokta = o gün en çok giren kişinin rengi</p>
      </div>

      <div className="champ-card">
        <span className="champ-emoji" aria-hidden>👑</span>
        <div className="champ-text">
          <span className="champ-label">Bu haftanın şampiyonu</span>
          <strong className="champ-name">{champ ? `${champ.name} · ${champ.count} ziyaret` : "Henüz veri yok"}</strong>
        </div>
        {champ ? (
          <span className="plain-avatar" style={{ width: 46, height: 46 }}>
            {memberOf(champ.name)?.avatar_url ? (
              <Avatar emoji={memberOf(champ.name)?.emoji ?? "🙂"} color={memberOf(champ.name)?.color ?? "#f2711c"} avatarUrl={memberOf(champ.name)?.avatar_url} size={46} />
            ) : (
              <span aria-hidden style={{ fontSize: 23 }}>{memberOf(champ.name)?.emoji ?? "🙂"}</span>
            )}
          </span>
        ) : null}
      </div>
    </>
  );
}
