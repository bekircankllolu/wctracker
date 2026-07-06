import Avatar from "./Avatar";
import type { Member } from "../members";
import type { Visit } from "../lib/useVisits";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

type Props = { members: Member[]; visits: Visit[] };

function localDay(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function Calendar({ members, visits }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const memberOf = (n: string) => members.find((m) => m.name === n);

  // Gün -> kişi -> adet
  const byDay = new Map<string, Map<string, number>>();
  for (const v of visits) {
    const d = new Date(v.created_at);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const key = localDay(v.created_at);
    const m = byDay.get(key) ?? new Map();
    m.set(v.member_name, (m.get(v.member_name) ?? 0) + 1);
    byDay.set(key, m);
  }

  const dayTop = (day: number) => {
    const m = byDay.get(`${year}-${month}-${day}`);
    if (!m) return null;
    let name = "", count = 0, total = 0;
    for (const [n, c] of m) { total += c; if (c > count) { count = c; name = n; } }
    return { name, total };
  };

  // Bu haftanın (Pzt-Paz) şampiyonu
  const dow = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - dow);
  const weekCounts = new Map<string, number>();
  for (const v of visits) {
    const t = new Date(v.created_at).getTime();
    if (t >= monday.getTime()) weekCounts.set(v.member_name, (weekCounts.get(v.member_name) ?? 0) + 1);
  }
  let champ: { name: string; count: number } | null = null;
  for (const [n, c] of weekCounts) if (!champ || c > champ.count) champ = { name: n, count: c };

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="cal-wrap">
      <div className="champ-card">
        <span className="champ-emoji" aria-hidden>👑</span>
        <div className="champ-text">
          <span className="champ-label">Bu haftanın şampiyonu</span>
          {champ ? (
            <strong className="champ-name">{champ.name} · {champ.count} ziyaret</strong>
          ) : (
            <strong className="champ-name">Henüz veri yok</strong>
          )}
        </div>
        {champ ? (
          <Avatar emoji={memberOf(champ.name)?.emoji ?? "🙂"} color={memberOf(champ.name)?.color ?? "#e8637a"} avatarUrl={memberOf(champ.name)?.avatar_url} size={44} />
        ) : null}
      </div>

      <div className="panel cal-panel">
        <div className="cal-head">
          <h2 className="panel-h">{MONTHS[month]} {year}</h2>
          <span className="panel-p">En çok kim girmiş?</span>
        </div>
        <div className="cal-grid cal-dow">
          {DAYS.map((d) => <span key={d} className="cal-dowcell">{d}</span>)}
        </div>
        <div className="cal-grid">
          {cells.map((day, i) => {
            if (day === null) return <span key={`b${i}`} className="cal-cell empty" />;
            const top = dayTop(day);
            const mem = top ? memberOf(top.name) : null;
            const isToday = day === now.getDate();
            return (
              <span
                key={day}
                className={`cal-cell ${top ? "has" : ""} ${isToday ? "today" : ""}`}
                style={top && mem ? { ["--c" as string]: mem.color } : undefined}
              >
                <span className="cal-num">{day}</span>
                {top ? <span className="cal-count">{top.total}</span> : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
