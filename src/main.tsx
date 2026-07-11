import React from "react";
import ReactDOM from "react-dom/client";
import ConfigurationError from "./components/ConfigurationError";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const hasSupabaseKey = Boolean(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
);
const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && hasSupabaseKey,
);

if (!configured) {
  root.render(<ConfigurationError />);
} else {
  import("./App").then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
}

// PWA service worker — yalnızca üretimde, sayfa yüklendikten sonra kaydet.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* kayıt başarısızsa uygulama yine de çalışır */
    });
  });
}
