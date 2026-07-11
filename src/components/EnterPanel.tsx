type Props = {
  identity: string | null;
  disabled: boolean;
  onEnter: () => void;
  onPickIdentity: () => void;
  onManage: () => void;
};

export default function EnterPanel({
  identity,
  disabled,
  onEnter,
  onPickIdentity,
  onManage,
}: Props) {
  if (!identity) {
    return (
      <div className="tile enter-panel">
        <p className="enter-hello">Bu telefonda kim var? 📱</p>
        <button className="enter-btn" onClick={onPickIdentity}>
          Kim olduğunu seç
        </button>
        <div className="enter-links">
          <button className="link-btn" onClick={onManage}>
            Kadroyu düzenle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tile enter-panel">
      <p className="enter-hello">
        Merhaba <strong>{identity}</strong> 👋
      </p>
      <button className="enter-btn" disabled={disabled} onClick={onEnter}>
        🚽 Tuvalete girdim
      </button>
      <div className="enter-links">
        <button className="link-btn" onClick={onPickIdentity}>
          Ben {identity} değilim
        </button>
        <button className="link-btn" onClick={onManage}>
          Kadroyu düzenle
        </button>
      </div>
    </div>
  );
}
