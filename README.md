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
| `note` | text, null | İçeridekinin bıraktığı not |
| `photo_url` | text, null | İçeridekinin eklediği fotoğrafın URL'i |
| `updated_at` | timestamptz | Otomatik güncellenir |

Diğer tablolar (hepsinde Realtime + aile-içi gevşek RLS):

- **`members`** — düzenlenebilir kadro (`name`, `emoji`, `color`, `sort_order`).
- **`visits`** — tamamlanan her ziyaret (`member_name`, `duration_seconds`, …);
  istatistikler bundan hesaplanır. Çıkışta bir kayıt eklenir.
- **`messages`** — mini sohbet (`sender`, `body` ≤ 100 karakter).

Fotoğraflar `wc-photos` adlı public Storage bucket'ında tutulur.

## Özellikler

- **Canlı durum:** DOLU/MÜSAİT + içeridekinin adı + canlı süre sayacı.
- **Düzenlenebilir kadro:** "Kadroyu düzenle" ile aile bireyi ekle / düzenle /
  sil (isim, emoji, renk). Tüm cihazlara anında yansır.
- **Not düşme:** İçerideki kişi hazır çipler veya 80 karakterlik serbest metinle
  not bırakır; not kartta görünür.
- **Tuvalet Ligi (istatistik):** En çok giren · tek seferde en uzun · toplamda
  en çok süre — canlı hesaplanır.
- **Dürtme:** İçeridekini dışarıdakiler dürtebilir; kart titrer + bildirim
  (Realtime broadcast, kalıcı kayıt yok).
- **Mini sohbet:** 100 karakter sınırlı, canlı. Gönderen kimliği "Ben kimim?"
  ile seçilir (cihazda saklanır).
- **Fotoğraf:** İçerideki kişi bir kare ekleyebilir; kartta önizlenir.

Kadro koda gömülü değil, veritabanından gelir. Emoji/renk seçenekleri
`src/members.ts` içinde tanımlıdır.

## Test (canlı senkron)

`npm run dev` sonrası uygulamayı **iki ayrı sekmede** açın. Birinde bir isme
dokunun → diğer sekmede anında "DOLU", süre sayacı ve not belirmeli. "Çıktım" →
her iki sekme de anında "MÜSAİT"e döner. Kadro değişiklikleri de anında yansır.

## Derleme

```bash
npm run build
```
