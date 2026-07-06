import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    "Supabase ayarları eksik. .env.local dosyasında VITE_SUPABASE_URL ve " +
      "VITE_SUPABASE_ANON_KEY tanımlı olmalı (.env.example dosyasına bakın).",
  );
}

export const supabase = createClient(url, anonKey);
