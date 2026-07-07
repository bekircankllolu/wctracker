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
    <div className="card queue-card">
      <div className="queue-head">
        <span>🚻 Sırada {queue.length} kişi</span>
        {meInQueue ? <span className="queue-myplace">Sıran: {myPlace}.</span> : null}
      </div>

      {queue.length > 0 ? (
        <ol className="queue-list">
          {queue.map((q, i) => {
            const m = memberOf(q.member_name);
            const mine = q.member_name === identity;
            return (
              <li key={q.id} className={`queue-item ${mine ? "mine" : ""}`}>
                <span className="queue-rank">{i + 1}</span>
                <Avatar
                  emoji={m?.emoji ?? "🙂"}
                  color={m?.color ?? "#f2711c"}
                  avatarUrl={m?.avatar_url ?? null}
                  size={30}
                />
                <span className="queue-name">{q.member_name}{mine ? " (sen)" : ""}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="queue-empty">Henüz kimse sırada değil.</div>
      )}

      {canJoin ? (
        meInQueue ? (
          <button className="queue-btn leave" onClick={onLeave}>Sıradan çık</button>
        ) : (
          <button className="queue-btn join" onClick={onJoin}>🙋 Sıraya gir</button>
        )
      ) : !identity ? (
        <div className="queue-hint">Sıraya girmek için önce “Ben kimim?” seç.</div>
      ) : null}
    </div>
  );
}
