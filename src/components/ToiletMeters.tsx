const PAPER = [
  { label: "Bitmiş", value: 0, cls: "danger" },
  { label: "Az kalmış", value: 30, cls: "warn" },
  { label: "Biraz bitmiş", value: 70, cls: "ok" },
  { label: "Daha çok var", value: 100, cls: "ok" },
];
function paperStage(level: number): number {
  if (level <= 10) return 0;
  if (level <= 45) return 1;
  if (level <= 85) return 2;
  return 3;
}

const SMELL = [
  { label: "Kokmuyor", emoji: "🌿", cls: "s0" },
  { label: "Az kokuyor", emoji: "😷", cls: "s1" },
  { label: "Leş gibi", emoji: "🤢", cls: "s2" },
];

type Props = {
  paperLevel: number;
  smellLevel: number;
  canSetSmell: boolean;
  onPaper: (v: number) => void;
  onSmell: (v: number) => void;
};

export default function ToiletMeters({ paperLevel, smellLevel, canSetSmell, onPaper, onSmell }: Props) {
  const stage = paperStage(paperLevel);
  const paper = PAPER[stage];
  const smell = SMELL[Math.max(0, Math.min(2, smellLevel))];

  return (
    <div className="meters">
      <div className="card meter">
        <div className="meter-label"><span aria-hidden>🧻</span> Tuvalet kağıdı</div>
        <div className={`meter-pct ${paper.cls}`}>{paper.label}</div>
        <div className="gauge">
          <div className={`gauge-fill ${paper.cls}`} style={{ width: `${paperLevel}%` }} />
        </div>
        <div className="paper-seg">
          {PAPER.map((p, i) => (
            <button
              key={i}
              className={`paper-seg-btn ${p.cls} ${stage === i ? "on" : ""}`}
              onClick={() => onPaper(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card meter">
        <div className="meter-label"><span aria-hidden>👃</span> Koku durumu</div>
        <div className={`smell-badge ${smell.cls}`}>{smell.emoji} {smell.label}</div>
        {canSetSmell ? (
          <div className="smell-seg">
            {SMELL.map((sm, i) => (
              <button
                key={i}
                className={`smell-seg-btn ${sm.cls} ${smellLevel === i ? "on" : ""}`}
                onClick={() => onSmell(i)}
              >
                {sm.emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="meter-hint">Kokuyu içerideki kişi ayarlar.</div>
        )}
      </div>
    </div>
  );
}
