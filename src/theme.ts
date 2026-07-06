// Merkezi renk paleti — web (App.css'teki CSS değişkenleriyle aynı değerler)
// ve ileride React Native tarafının ortak kullanabilmesi için tek kaynak.
export const palette = {
  bg: "#ECE7DF",
  card: "#FFFFFF",
  card2: "#F6F2EB",
  ink: "#211E1A",
  inkDim: "#8B847A",
  line: "#E7E1D7",

  amber: "#F6B31B",
  amberDeep: "#E09400",

  free: "#7E9A3C", // müsait (zeytin yeşili)
  occupied: "#C85A3C", // dolu (terrakota)

  brown: "#6E4A3A",
  olive: "#8A9A3B",
  taupe: "#6B6A5C",
};

// İstatistik bar grafiği / kişi rengi olmayan durumlar için topraksı seri.
export const chartColors = [
  "#F6B31B",
  "#6E4A3A",
  "#8A9A3B",
  "#6B6A5C",
  "#C85A3C",
  "#B98A2E",
];

export function colorForIndex(i: number): string {
  return chartColors[i % chartColors.length];
}
