import { useState } from "react";
import type { Phase } from "../lib/useWcState";

const PAPER = [
  { label: "Bitmiş", value: 0, dots: 0 },
  { label: "Az kalmış", value: 30, dots: 1 },
  { label: "Biraz bitmiş", value: 70, dots: 3 },
  { label: "Daha çok var", value: 100, dots: 4 },
];
function paperStage(level: number): number {
  if (level <= 10) return 0;
  if (level <= 45) return 1;
  if (level <= 85) return 2;
  return 3;
}

const SMELL = [
  { label: "Kokmuyor", emoji: "🌿", hint: "tertemiz 🌸" },
  { label: "Az kokuyor", emoji: "😷", hint: "biraz havalandırmak iyi olur 🌬️" },
  { label: "Leş gibi", emoji: "🤢", hint: "kapıyı kapalı tut 🙏" },
];

type Props = {
  phase: Phase;
  paperLevel: number;
  smellLevel: number;
  canSetSmell: boolean;
  onPaper: (v: number) => void;
  onSmell: (v: number) => void;
};

export default function ToiletMeters({ phase, paperLevel, smellLevel, canSetSmell, onPaper, onSmell }: Props) {
  const [paperOpen, setPaperOpen] = useState(false);
  const stage = paperStage(paperLevel);
  const paper = PAPER[stage];
  const smell = SMELL[Math.max(0, Math.min(2, smellLevel))];
  const smellHint = canSetSmell ? null : phase === "occupied" ? "içerideki kişi ayarlar" : smell.hint;

  return (
    <div className="meters">
      <button className="tile tile--mint meter-tile" onClick={() => setPaperOpen(true)}>
        <span className="tile-icon" aria-hidden>🧻</span>
        <span className="tile-label mint">Kağıt</span>
        <span className="tile-value">{paper.label}</span>
        <span className="dot-row">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`dot ${i < paper.dots ? "on" : ""}`} />
          ))}
        </span>
      </button>

      <div className="tile tile--lavender meter-tile">
        {canSetSmell ? (
          <span className="tile-label lavender">Koku · sen ayarla</span>
        ) : (
          <>
            <span className="tile-icon" aria-hidden>{smell.emoji}</span>
            <span className="tile-label lavender">Koku</span>
          </>
        )}
        <span className="tile-value">{smell.label}</span>
        {canSetSmell ? (
          <div className="smell-seg">
            {SMELL.map((sm, i) => (
              <button
                key={i}
                className={`smell-seg-btn ${smellLevel === i ? "on" : ""}`}
                onClick={() => onSmell(i)}
                aria-label={sm.label}
              >
                {sm.emoji}
              </button>
            ))}
          </div>
        ) : (
          <span className="tile-hint lavender">{smellHint}</span>
        )}
      </div>

      {paperOpen ? (
        <div className="sheet-backdrop" onClick={() => setPaperOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <h2>Tuvalet kağıdı</h2>
              <button className="sheet-close" onClick={() => setPaperOpen(false)} aria-label="Kapat">✕</button>
            </div>
            <div className="paper-pick">
              {PAPER.map((p, i) => (
                <button
                  key={i}
                  className={`paper-pick-btn ${stage === i ? "on" : ""}`}
                  onClick={() => { onPaper(p.value); setPaperOpen(false); }}
                >
                  <span className="dot-row">
                    {[0, 1, 2, 3].map((d) => <span key={d} className={`dot ${d < p.dots ? "on" : ""}`} />)}
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
