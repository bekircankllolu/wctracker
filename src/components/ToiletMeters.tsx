import type { Phase } from "../lib/useWcState";
import AppIcon, { type AppIconName } from "./AppIcon";

const PAPER = [
  { label: "Bitmiş", value: 0, fill: "24%" },
  { label: "Az kalmış", value: 30, fill: "46%" },
  { label: "Biraz bitmiş", value: 70, fill: "72%" },
  { label: "Daha çok var", value: 100, fill: "100%" },
] satisfies Array<{ label: string; value: number; fill: string }>;
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
  const stage = paperStage(paperLevel);
  const paper = PAPER[stage];
  const smell = SMELL[Math.max(0, Math.min(SMELL.length - 1, smellLevel))];
  const smellHint = canSetSmell ? null : phase === "occupied" ? "içerideki kişi ayarlar" : smell.hint;

  return (
    <div className="meters">
      {/* Kağıt herkes tarafından ayarlanabilir — koku gibi dokununca doğrudan değişir.
          Seviyeler artan doluluk çubuğuyla gösterilir (az → çok). */}
      <div className="tile tile--mint meter-tile">
        <span className="tile-label mint">Kağıt · sen ayarla</span>
        <span className="tile-value">{paper.label}</span>
        <div className="meter-seg">
          {PAPER.map((p, i) => (
            <button
              key={p.label}
              className={`meter-seg-btn paper-seg-btn ${stage === i ? "on" : ""}`}
              onClick={() => onPaper(p.value)}
              aria-label={p.label}
            >
              <span className="paper-bar-track" aria-hidden>
                <span className="paper-bar" style={{ height: p.fill }} />
              </span>
            </button>
          ))}
        </div>
      </div>

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
          <div className="meter-seg">
            {SMELL.map((sm, i) => (
              <button
                key={sm.icon}
                className={`meter-seg-btn ${smellLevel === i ? "on" : ""}`}
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
    </div>
  );
}
