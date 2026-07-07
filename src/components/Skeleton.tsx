// Yükleme sırasında Durum ekranının iskeleti (algılanan hızı artırır).
export default function Skeleton() {
  return (
    <main className="app-main" aria-hidden>
      <div className="sk sk-banner" />
      <div className="sk sk-dial" />
      <div className="sk sk-card" />
      <div className="sk sk-card" />
    </main>
  );
}
