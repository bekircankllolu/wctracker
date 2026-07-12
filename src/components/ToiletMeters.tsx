const PAPER = [
  { label: "Bitmiş", value: 0 },
  { label: "Az kaldı", value: 30 },
  { label: "Yeterli", value: 70 },
  { label: "Dolu", value: 100 },
] satisfies Array<{ label: string; value: number }>;
function paperStage(level: number): number {
  if (level <= 10) return 0;
  if (level <= 45) return 1;
  if (level <= 85) return 2;
  return 3;
}

const SMELL = [
  { label: "Çok iyi" },
  { label: "İyi" },
  { label: "Kötü" },
  { label: "Çok kötü" },
];

type Props = {
  paperLevel: number;
  smellLevel: number;
  canEdit: boolean;
  onPaper: (v: number) => void;
  onSmell: (v: number) => void;
};

export default function ToiletMeters({ paperLevel, smellLevel, canEdit, onPaper, onSmell }: Props) {
  const stage = paperStage(paperLevel);
  const paper = PAPER[stage];
  const smell = SMELL[Math.max(0, Math.min(SMELL.length - 1, smellLevel))];

  return (
    <div className="meters">
      <div className="tile tile--paper meter-tile">
        <span className="tile-label paper">Tuvalet kağıdı</span>
        <span className="tile-value">{paper.label}</span>
        {canEdit ? (
          <div className="meter-options" aria-label="Tuvalet kağıdı durumunu seç">
            {PAPER.map((p, i) => (
              <button
                key={p.label}
                className={`meter-option ${stage === i ? "on" : ""}`}
                onClick={() => onPaper(p.value)}
                aria-pressed={stage === i}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="tile tile--lavender meter-tile">
        <span className="tile-label lavender">Koku</span>
        <span className="tile-value">{smell.label}</span>
        {canEdit ? (
          <div className="meter-options" aria-label="Koku durumunu seç">
            {SMELL.map((sm, i) => (
              <button
                key={sm.label}
                className={`meter-option ${smellLevel === i ? "on" : ""}`}
                onClick={() => onSmell(i)}
                aria-pressed={smellLevel === i}
              >
                {sm.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
