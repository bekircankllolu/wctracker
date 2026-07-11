// Yükleme sırasında Durum ekranının iskeleti (algılanan hızı artırır).
export default function Skeleton() {
  return (
    <main className="app-main" aria-hidden>
      <div className="sk sk-hero" />
      <div className="sk-row">
        <div className="sk sk-tile" />
        <div className="sk sk-tile" />
      </div>
    </main>
  );
}
