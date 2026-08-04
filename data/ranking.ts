import type { RankingEntry, RankingLeader } from "@/types/ranking";

export const RANKING_LEADERS: RankingLeader[] = [
  { position: 1, name: "RafaelDev", coupons: 42, exp: "18.560" },
  { position: 2, name: "CamilaCode", coupons: 38, exp: "17.940" },
  { position: 3, name: "LucasByte", coupons: 34, exp: "17.120" }
];

export const RANKING_ENTRIES: RankingEntry[] = [
  { position: 4, name: "MarcosCmd", title: "Guerreiro de Terminal", coupons: 32, exp: "15.870", progress: 88 },
  { position: 5, name: "BiaScript", title: "Tecelã de Interfaces", coupons: 30, exp: "14.260", progress: 78 },
  { position: 6, name: "DevJunior", title: "Paladino do Frontend", coupons: 29, exp: "13.870", progress: 72 },
  { position: 7, name: "AnaQA", title: "Sentinela dos Bugs", coupons: 27, exp: "12.450", progress: 65 },
  { position: 8, name: "GuiTeste", title: "Mago dos Testes", coupons: 25, exp: "11.780", progress: 57 },
  { position: 9, name: "LeoStack", title: "Ranger Full-Stack", coupons: 24, exp: "10.980", progress: 49 },
  { position: 10, name: "JulioAPI", title: "Alquimista de APIs", coupons: 22, exp: "9.650", progress: 42 }
];
