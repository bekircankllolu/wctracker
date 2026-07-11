export default function ConfigurationError() {
  return (
    <main className="config-error" role="alert">
      <div className="config-error-card">
        <strong>Uygulama yapılandırılamadı</strong>
        <p>Supabase bağlantı bilgileri eksik.</p>
        <code>VITE_SUPABASE_URL</code>
        <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
      </div>
    </main>
  );
}
