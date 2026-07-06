// Merkezi renk paleti — web (App.css'teki CSS değişkenleriyle aynı değerler)
// ve ileride React Native tarafının ortak kullanabilmesi için tek kaynak.
export const palette = {
  bg: "#f1ece3",
  card: "#ffffff",
  card2: "#f5f0e7",
  ink: "#211d19",
  inkDim: "#8a8178",
  line: "#eae3d8",

  amber: "#f6b31b",
  amberDeep: "#e09400",
  coral: "#ec6a80",
  coralDeep: "#d8536b",
  teal: "#2f8f80",
  tealDeep: "#26766a",
  cream: "#fbf5e2",

  free: "#2f8f80", // müsait (teal)
  occupied: "#ec6a80", // dolu (mercan)
};

// Leaderboard sıra renkleri (#1, #2, #3) — referans stiliyle.
export const rankColors = ["#ec6a80", "#f3ead2", "#f6b31b"];

// İstatistik / avatar rengi olmayan durumlar için seri.
export const chartColors = [
  "#ec6a80",
  "#2f8f80",
  "#f6b31b",
  "#6e4a3a",
  "#8a9a3b",
  "#6b6a5c",
];

export function colorForIndex(i: number): string {
  return chartColors[i % chartColors.length];
}
