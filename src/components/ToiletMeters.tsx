const SMELL = [
  { label: "Kokmuyor", emoji: "🌸", cls: "s0" },
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

  return (
    <div className="meters">
      {/* Tuvalet kağıdı */}
      <div className="meter">
        <div className="meter-top">
          <span className="meter-label">🧻 Tuvalet kağıdı</span>
          <span className={`meter-val ${paperCls}`}>%{paperLevel}</span>
        </div>
        <div className="gauge">
          <div className={`gauge-fill ${paperCls}`} style={{ width: `${paperLevel}%` }} />
        </div>
        <div className="meter-row">
          <input
            className="range paper-range"
            type="range" min={0} max={100} step={5}
            value={paperLevel}
            onChange={(e) => onPaper(Number(e.target.value))}
          />
          <button className="mini-btn" onClick={() => onPaper(100)}>Doldurdum</button>
        </div>
        {paperLevel <= 15 ? <div className="meter-warn">Kağıt bitmek üzere! 🚨</div> : null}
      </div>

      {/* Koku */}
      <div className="meter">
        <div className="meter-top">
          <span className="meter-label">👃 Koku durumu</span>
          <span className={`smell-badge ${smell.cls}`}>{smell.emoji} {smell.label}</span>
        </div>
        {canSetSmell ? (
          <>
            <input
              className={`range smell-range ${smell.cls}`}
              type="range" min={0} max={2} step={1}
              value={smellLevel}
              onChange={(e) => onSmell(Number(e.target.value))}
            />
            <div className="smell-ticks">
              <span>🌸</span><span>😷</span><span>🤢</span>
            </div>
            {smellLevel >= 2 ? (
              <div className="meter-warn">Çıkınca 3 dk havalandırma başlar 💨</div>
            ) : null}
          </>
        ) : (
          <div className="meter-hint">Kokuyu içerideki kişi ayarlar.</div>
        )}
      </div>
    </div>
  );
}
