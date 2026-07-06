// Sabit aile listesi. Yeni birini eklemek için bu diziye bir satır eklemeniz yeterli.
// `name` alanı veritabanına "içerideki kişi" olarak yazılır, bu yüzden benzersiz olmalı.
export type Member = {
  name: string;
  emoji: string;
  color: string;
};

export const MEMBERS: Member[] = [
  { name: "Baba", emoji: "👨", color: "#3b82f6" },
  { name: "Anne", emoji: "👩", color: "#ec4899" },
  { name: "Abla", emoji: "👧", color: "#a855f7" },
  { name: "Abi", emoji: "🧑", color: "#f59e0b" },
  { name: "Kardeş", emoji: "🧒", color: "#22c55e" },
];

export function findMember(name: string | null | undefined): Member | undefined {
  if (!name) return undefined;
  return MEMBERS.find((m) => m.name === name);
}
