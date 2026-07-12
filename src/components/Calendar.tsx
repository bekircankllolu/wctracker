import { useMemo, useState } from "react";
import Avatar from "./Avatar";
import type { Member } from "../members";
import type { Visit } from "../lib/useVisits";
import { MAX_REASONABLE_STAY } from "../lib/format";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const LONG_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

type Props = { members: Member[]; visits: Visit[] };

export default function Calendar({ members, visits: allVisits }: Props) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [expanded, setExpanded] = useState(false);
  const memberMap = useMemo(() => new Map(members.map((member) => [member.name, member])), [members]);

  // Anormal (sayaç unutulmuş) oturumları takvim/şampiyon sayımına katma —
  // liderlik tablosuyla tutarlı kalsın.
  const visits = useMemo(
    () => allVisits.filter((v) => v.duration_seconds <= MAX_REASONABLE_STAY),
    [allVisits],
  );

  const byDay = useMemo(() => {
    const result = new Map<string, Map<string, number>>();
    for (const visit of visits) {
      const visitKey = key(new Date(visit.created_at));
      const counts = result.get(visitKey) ?? new Map<string, number>();
      counts.set(visit.member_name, (counts.get(visit.member_name) ?? 0) + 1);
      result.set(visitKey, counts);
    }
    return result;
  }, [visits]);
  const dayInfo = (d: Date) => {
    const mm = byDay.get(key(d));
    if (!mm) return null;
    let name = "", best = 0, total = 0;
    for (const [n, c] of mm) { total += c; if (c > best) { best = c; name = n; } }
    return { name, total };
  };

  const todayKey = key(today);
  const champ = useMemo(() => {
    const dailyCounts = new Map<string, number>();
    for (const visit of visits) {
      if (key(new Date(visit.created_at)) === todayKey) {
        dailyCounts.set(visit.member_name, (dailyCounts.get(visit.member_name) ?? 0) + 1);
      }
    }
    let leader: { name: string; count: number } | null = null;
    for (const [name, count] of dailyCounts) {
      if (!leader || count > leader.count) leader = { name, count };
    }
    return leader;
  }, [visits, todayKey]);

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [view]);

  const [dir, setDir] = useState<"prev" | "next">("next");
  const prev = () => { setDir("prev"); setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 })); };
  const next = () => { setDir("next"); setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })); };

  return (
    <>
      <button className="cal-summary" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span>{today.getDate()} {MONTHS[today.getMonth()]} {today.getFullYear()} {LONG_DAYS[today.getDay()]}</span>
        <span className={`cal-summary-arrow ${expanded ? "open" : ""}`} aria-hidden>⌄</span>
      </button>

      {expanded ? <div className="tile cal-panel">
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
            const col = info ? memberMap.get(info.name)?.color ?? "#f2711c" : undefined;
            return (
              <span key={i} className={`cal-cell ${!inMonth ? "out" : ""} ${isToday ? "today" : ""}`}>
                <span className="cal-num">{d.getDate()}</span>
                {info ? <span className="cal-dot" style={{ background: col }} /> : null}
              </span>
            );
          })}
        </div>
        <p className="cal-legend"><span className="cal-legend-dot" /> Nokta = o gün en çok giren kişinin rengi</p>
      </div> : null}

      <div className="champ-card">
        <div className="champ-text">
          <span className="champ-label">Bugünün lideri</span>
          <strong className="champ-name">{champ ? `${champ.name} · ${champ.count} ziyaret` : "Henüz veri yok"}</strong>
        </div>
        {champ ? (
          <span className="plain-avatar" style={{ width: 46, height: 46 }}>
            {memberMap.get(champ.name)?.avatar_url ? (
              <Avatar emoji={memberMap.get(champ.name)?.emoji ?? "🙂"} color={memberMap.get(champ.name)?.color ?? "#f2711c"} avatarUrl={memberMap.get(champ.name)?.avatar_url} size={46} />
            ) : (
              <span aria-hidden style={{ fontSize: 23 }}>{memberMap.get(champ.name)?.emoji ?? "🙂"}</span>
            )}
          </span>
        ) : null}
      </div>
    </>
  );
}
