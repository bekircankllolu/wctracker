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
  const paperCls = paperLevel <= 15 ? "danger" : paperLevel <= 40 ? "warn" : "ok";
  const smell = SMELL[Math.max(0, Math.min(2, smellLevel))];

  function tapGauge(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    onPaper(Math.round(((e.clientX - r.left) / r.width) * 100));
  }

  return (
    <div className="meters">
      <div className="card meter">
        <div className="meter-label"><span aria-hidden>🧻</span> Tuvalet kağıdı</div>
        <div className={`meter-pct ${paperCls}`}>%{paperLevel}</div>
        <div className="gauge" onClick={tapGauge} title="Seviyeyi ayarla">
          <div className={`gauge-fill ${paperCls}`} style={{ width: `${paperLevel}%` }} />
        </div>
        <button className="ghost-btn" onClick={() => onPaper(100)}>Doldurdum</button>
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
