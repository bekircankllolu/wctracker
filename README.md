# WC Tracker 🚽

Kalabalık bir aile için **canlı tuvalet takip** uygulaması. Bir kişi tuvalete
girince tüm aile bireylerinin telefonunda anında **DOLU — Baba** gibi görünür;
boşken **BOŞ** gösterir. Girildiği andan itibaren canlı bir süre sayacı çalışır.

- **Frontend:** Vite + React + TypeScript
- **Canlı senkron:** Supabase Realtime (cihazlar arası anlık güncelleme)
- Login yok — aile içi, sürtünmesiz kullanım. Herkes kendi ismine dokunup
  "girer", "Çıktım" ile çıkar.

## Kurulum

```bash
npm install
cp .env.example .env.local   # ve değerleri doldurun
npm run dev
```

### Ortam değişkenleri (`.env.local`)

| Değişken | Açıklama |
|---|---|
| `VITE_SUPABASE_URL` | Supabase proje URL'i (Project Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | Publishable / anon anahtar |

## Veritabanı

Tek satırlık `wc_state` tablosu tüm durumu tutar:

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | smallint (=1) | Tek tuvalet, tek satır |
| `occupant` | text, null | İçerideki kişinin adı; boşsa `NULL` |
| `entered_at` | timestamptz, null | Girildiği an (süre sayacı için) |
| `updated_at` | timestamptz | Otomatik güncellenir |

Tabloda Realtime açıktır ve aile içi kullanım için gevşek RLS policy'leri
(`select` + `update`) tanımlıdır.

## Aile bireylerini düzenleme

`src/members.ts` içindeki `MEMBERS` dizisini düzenleyin — isim, emoji ve renk.

## Test (canlı senkron)

`npm run dev` sonrası uygulamayı **iki ayrı sekmede** açın. Birinde bir isme
dokunun → diğer sekmede anında "DOLU" ve süre sayacı belirmeli. "Çıktım" →
her iki sekme de anında "BOŞ"a döner.

## Derleme

```bash
npm run build
```
