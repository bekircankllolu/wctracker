// Süre biçimlendirme — tek kaynak. Her zaman insan-okunur:
//   >= 1 saat → "1s 26dk"   (asla "6086 dk 27 sn" gibi çiğ değer)
//   >= 1 dk   → "5 dk 12 sn"
//   < 1 dk    → "42 sn"
export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.round((s % 3600) / 60);
    return m > 0 ? `${h}s ${m}dk` : `${h}s`;
  }
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem} sn`;
  return `${m} dk ${rem} sn`;
}

// Sayaç durdurulmayı unutmuş olabilir (ör. "çıktım"a basılmadı). Bu eşiğin
// üstündeki oturumlar anormal sayılır ve istatistik/rekorlara katılmaz.
export const MAX_REASONABLE_STAY = 3 * 3600; // 3 saat
