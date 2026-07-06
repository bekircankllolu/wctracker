import { supabase } from "../supabaseClient";

// Bir görseli wc-photos bucket'ına yükler ve public URL'ini döndürür.
export async function uploadImage(file: File, prefix = ""): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage
    .from("wc-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) return null;
  return supabase.storage.from("wc-photos").getPublicUrl(path).data.publicUrl;
}
