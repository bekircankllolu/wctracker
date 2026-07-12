import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import AppIcon from "./AppIcon";
import { useElapsed, useCountdown } from "../lib/timers";
import type { Phase } from "../lib/useWcState";

type Props = {
  phase: Phase;
  occupant: string | null;
  enteredAt: string | null;
  note: string | null;
  photoUrl: string | null;
  emoji: string;
  color: string;
  avatarUrl: string | null;
  amOccupant: boolean;
  identity: string | null;
  poked: boolean;
  cooldownUntil: string | null;
  multiplier: number;
};

const pad = (n: number) => n.toString().padStart(2, "0");
function clock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

export default function StatusCard({
  phase, occupant, enteredAt, note, photoUrl, emoji, color, avatarUrl, amOccupant, identity, poked, cooldownUntil, multiplier,
}: Props) {
  const elapsed = useElapsed(phase === "occupied" ? enteredAt : null);
  const cooldownMs = useCountdown(phase === "cooldown" ? cooldownUntil : null);

  // Boş ↔ Dolu arası geçişte kısa bir geçiş videosu oynatılır, bitince o anki
  // durumun kalıcı (loop'lu) videosuna geçilir.
  const prevPhaseRef = useRef(phase);
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    const isSwap = (prev === "free" || prev === "occupied") && (phase === "free" || phase === "occupied") && prev !== phase;
    if (isSwap) setTransitioning(true);
    prevPhaseRef.current = phase;
  }, [phase]);
  // Video "ended" olayı bir sebeple tetiklenmezse (ör. autoplay engellenirse)
  // geçiş ekranında takılı kalmamak için güvenlik zaman aşımı.
  useEffect(() => {
    if (!transitioning) return;
    const t = setTimeout(() => setTransitioning(false), 6000);
    return () => clearTimeout(t);
  }, [transitioning]);

  if (phase === "cooldown") {
    return (
      <div className="hero hero--butter hero--center">
        <span className="hero-pill self">● HAVALANDIRILIYOR</span>
        <span className="hero-emoji hero-icon hero-icon--smell" aria-hidden><AppIcon name="smell-awful" /></span>
        <span className="hero-clock">{mmss(cooldownMs)}</span>
        <span className="hero-sub center">Leş gibi kokuyor, biraz bekleyelim</span>
        {multiplier > 1 ? <span className="hero-chip">koku çarpanı ×{multiplier}</span> : null}
      </div>
    );
  }

  if (phase === "free") {
    return (
      <div className="hero hero--mint">
        {transitioning ? (
          <video
            key="transition-free"
            className="hero-video"
            src="/hero-transition.mp4"
            poster="/hero-bg-free.jpg"
            autoPlay muted playsInline
            onEnded={() => setTransitioning(false)}
          />
        ) : (
          <video className="hero-video" src="/hero-bg-free.mp4" poster="/hero-bg-free.jpg" autoPlay loop muted playsInline />
        )}
        <div className="hero-content">
          <div className="hero-top">
            <span className="hero-pill self">● BOŞ</span>
          </div>
          <div className="hero-center-block">
            <span className="hero-title">Müsait</span>
            <span className="hero-sub">Tuvalet boş, buyurun</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`hero hero--peach ${poked ? "poked" : ""}`}>
      {transitioning ? (
        <video
          key="transition-occupied"
          className="hero-video"
          src="/hero-transition.mp4"
          poster="/hero-bg-occupied.jpg"
          autoPlay muted playsInline
          onEnded={() => setTransitioning(false)}
        />
      ) : (
        <video className="hero-video" src="/hero-bg-occupied.mp4" poster="/hero-bg-occupied.jpg" autoPlay loop muted playsInline />
      )}
      <div className="hero-content">
        <div className="hero-top">
          <span className="hero-pill">{amOccupant ? "● SEN İÇERİDESİN" : "● DOLU"}</span>
          <span className="hero-avatar">
            {avatarUrl ? (
              <Avatar emoji={emoji} color={color} avatarUrl={avatarUrl} size={52} />
            ) : (
              <span className="hero-avatar-emoji" aria-hidden>{emoji}</span>
            )}
          </span>
        </div>
        <div className="hero-center-block">
          <span className="hero-time">{clock(elapsed)}</span>
          <span className="hero-sub">
            {amOccupant ? `Rahat ol ${identity}, süre işliyor 🚽` : `${occupant} içeride · şu kadar süredir 🚽`}
          </span>
        </div>
        {note ? <span className="hero-note">“{note}”</span> : null}
        {photoUrl ? <img className="hero-photo" src={photoUrl} alt="Tuvaletten kare" loading="lazy" /> : null}
      </div>
    </div>
  );
}
