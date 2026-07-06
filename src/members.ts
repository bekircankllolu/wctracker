// Kadro artık veritabanından (members tablosu) geliyor; uygulama içinden
// eklenip düzenlenebiliyor. Buradaki sabitler yalnızca ekleme/düzenleme
// formundaki emoji ve renk seçenekleridir.
export type Member = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
};

export const EMOJI_OPTIONS = [
  "🧔", "🧑", "👩", "👧", "👦", "🧒", "👨", "👵", "👴",
  "😎", "🤠", "🥳", "🐱", "🐶", "🦄", "🐸", "🐵", "🦊",
  "👽", "🤖", "🦖", "🍕", "⚽", "🎧",
];

export const COLOR_OPTIONS = [
  "#f97316", "#3b82f6", "#ec4899", "#a855f7", "#22c55e",
  "#ef4444", "#eab308", "#14b8a6", "#6366f1", "#f43f5e",
];
