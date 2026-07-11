import { useState } from "react";
import type { Phase } from "../lib/useWcState";
import AppIcon, { type AppIconName } from "./AppIcon";

const PAPER = [
  { label: "Bitmiş", value: 0, dots: 0, icon: "paper-empty" },
  { label: "Az kalmış", value: 30, dots: 1, icon: "paper-low" },
  { label: "Biraz bitmiş", value: 70, dots: 3, icon: "paper-medium" },
  { label: "Daha çok var", value: 100, dots: 4, icon: "paper-full" },
] satisfies Array<{ label: string; value: number; dots: number; icon: AppIconName }>;
function paperStage(level: number): number {
  if (level <= 10) return 0;
  if (level <= 45) return 1;
  if (level <= 85) return 2;
  return 3;
}

const SMELL = [
  { label: "Çok iyi", icon: "smell-good", hint: "mis gibi" },
  { label: "İyi", icon: "smell-fresh", hint: "tertemiz" },
  { label: "Kötü", icon: "smell-bad", hint: "biraz havalandırmak iyi olur" },
  { label: "Çok kötü", icon: "smell-awful", hint: "kapıyı kapalı tut" },
] satisfies Array<{ label: string; icon: AppIconName; hint: string }>;

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
  const smell = SMELL[Math.max(0, Math.min(SMELL.length - 1, smellLevel))];
  const smellHint = canSetSmell ? null : phase === "occupied" ? "içerideki kişi ayarlar" : smell.hint;

  return (
    <div className="meters">
      <button className="tile tile--mint meter-tile" onClick={() => setPaperOpen(true)}>
        <span className="tile-icon icon-paper" aria-hidden><AppIcon name={paper.icon} /></span>
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
            <span className="tile-icon icon-smell" aria-hidden><AppIcon name={smell.icon} /></span>
            <span className="tile-label lavender">Koku</span>
          </>
        )}
        <span className="tile-value">{smell.label}</span>
        {canSetSmell ? (
          <div className="smell-seg">
            {SMELL.map((sm, i) => (
              <button
                key={sm.icon}
                className={`smell-seg-btn ${smellLevel === i ? "on" : ""}`}
                onClick={() => onSmell(i)}
                aria-label={sm.label}
              >
                <AppIcon name={sm.icon} />
              </button>
            ))}
          </div>
        ) : (
          <span className="tile-hint lavender">{smellHint}</span>
        )}
      </div>

      {paperOpen ? (
        <div className="sheet-backdrop" onClick={() => setPaperOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paper-picker-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-head">
              <h2 id="paper-picker-title">Tuvalet kağıdı</h2>
              <button className="sheet-close" onClick={() => setPaperOpen(false)} aria-label="Kapat">✕</button>
            </div>
            <div className="paper-pick">
              {PAPER.map((p, i) => (
                <button
                  key={p.icon}
                  className={`paper-pick-btn ${stage === i ? "on" : ""}`}
                  onClick={() => { onPaper(p.value); setPaperOpen(false); }}
                >
                  <span className="paper-pick-icon" aria-hidden><AppIcon name={p.icon} /></span>
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
