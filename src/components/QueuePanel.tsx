import type { Member } from "../members";
import type { QueueEntry } from "../lib/useQueue";
import Avatar from "./Avatar";

type Props = {
  queue: QueueEntry[];
  members: Member[];
  identity: string | null;
  occupant: string | null;
  onJoin: () => void;
  onLeave: () => void;
};

export default function QueuePanel({ queue, members, identity, occupant, onJoin, onLeave }: Props) {
  const meInQueue = identity ? queue.some((q) => q.member_name === identity) : false;
  const myPlace = identity ? queue.findIndex((q) => q.member_name === identity) + 1 : 0;
  const canJoin = Boolean(identity) && identity !== occupant;
  const memberOf = (name: string) => members.find((m) => m.name === name);

  return (
    <div className="tile queue-tile">
      <div className="queue-head">
        <span className="queue-title">🚻 Sıra{queue.length > 0 ? ` · ${queue.length} kişi` : ""}</span>
        {meInQueue ? (
          <span className="queue-mypill">Sıran: {myPlace}.</span>
        ) : queue.length === 0 ? (
          <span className="queue-emptylabel">Henüz kimse sırada değil</span>
        ) : null}
      </div>

      {queue.length > 0 ? (
        <div className="queue-chips">
          {queue.map((q, i) => {
            const mine = q.member_name === identity;
            const m = memberOf(q.member_name);
            return (
              <span key={q.id} className={`queue-chip ${mine ? "mine" : ""}`}>
                {m?.avatar_url ? (
                  <Avatar emoji={m.emoji} color={m.color} avatarUrl={m.avatar_url} size={16} shape="rounded" />
                ) : (
                  <span aria-hidden>{m?.emoji ?? "🙂"}</span>
                )}
                <span className="queue-chip-name">{i + 1} · {q.member_name}{mine ? " (sen)" : ""}</span>
              </span>
            );
          })}
        </div>
      ) : null}

      {meInQueue ? (
        <button className="queue-btn leave" onClick={onLeave}>Sıradan çık</button>
      ) : canJoin ? (
        <button className="queue-btn join" onClick={onJoin}>🙋 Sıraya gir</button>
      ) : !identity ? (
        <div className="queue-hint">Sıraya girmek için önce “Ben kimim?” seç.</div>
      ) : null}
    </div>
  );
}
