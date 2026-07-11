// Merkezi renk paleti — web (index.css'teki CSS değişkenleriyle aynı değerler)
// ve ileride React Native tarafının ortak kullanabilmesi için tek kaynak.
export const palette = {
  bg: "#ffffff",
  card: "#ffffff",
  tile: "#f3f2ef",
  ink: "#111111",
  inkDim: "#a9a49c",
  line: "#e4e2dd",

  peach: "#ffd3c4", // dolu / aktif
  mint: "#cdedbb", // boş / kağıt
  lavender: "#ddd3ff", // koku / sohbet
  butter: "#ffe9a8", // lig / cooldown
  danger: "#ffb4a2", // uyarı / hata

  free: "#4c6b3a", // müsait (mint-ink)
  occupied: "#7a4632", // dolu (peach-ink)
};

// Leaderboard sıra renkleri (#1, #2, #3).
export const rankColors = ["#ffe9a8", "#f3f2ef", "#f3f2ef"];

// İstatistik / avatar rengi olmayan durumlar için seri.
export const chartColors = [
  "#ffd3c4",
  "#cdedbb",
  "#ddd3ff",
  "#ffe9a8",
  "#a9a49c",
  "#111111",
];

export function colorForIndex(i: number): string {
  return chartColors[i % chartColors.length];
}
