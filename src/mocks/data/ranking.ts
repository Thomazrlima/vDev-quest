import type { RankingEntry, RankingLeader } from "@/types/ranking";

export const RANKING_LEADERS: RankingLeader[] = [
    { position: 1, name: "RafaelDev", title: "Arquiteto da Guilda", level: 58, badges: ["champion", "guardian", "streak"], exp: "18.560", appearance: { hair: "dapper", shirt: "short", headwear: "none" } },
    { position: 2, name: "CamilaCode", title: "Tecelã de Interfaces", level: 54, badges: ["arcane", "streak"], exp: "17.940", appearance: { hair: "bob", shirt: "shortBoobs", headwear: "none" } },
    { position: 3, name: "LucasByte", title: "Ranger Full-Stack", level: 51, badges: ["guardian", "arcane"], exp: "17.120", appearance: { hair: "dapper", shirt: "short", headwear: "none" } },
];

export const RANKING_ENTRIES: RankingEntry[] = [
    { position: 4, name: "MarcosCmd", title: "Guerreiro de Terminal", level: 49, badges: ["guardian", "streak"], exp: "15.870", progress: 88, appearance: { hair: "dapper", shirt: "short", headwear: "cowboyHat" } },
    { position: 5, name: "BiaScript", title: "Tecelã de Interfaces", level: 47, badges: ["arcane", "streak"], exp: "14.260", progress: 78, appearance: { hair: "bob", shirt: "shortBoobs", headwear: "none" } },
    { position: 6, name: "DevJunior", title: "Paladino do Frontend", level: 44, badges: ["guardian"], exp: "13.870", progress: 72, appearance: { hair: "dapper", shirt: "short", headwear: "none" } },
    { position: 7, name: "AnaQA", title: "Sentinela dos Bugs", level: 42, badges: ["guardian", "arcane"], exp: "12.450", progress: 65, appearance: { hair: "bob", shirt: "shortBoobs", headwear: "cowboyHat" } },
    { position: 8, name: "GuiTeste", title: "Mago dos Testes", level: 39, badges: ["arcane"], exp: "11.780", progress: 57, appearance: { hair: "dapper", shirt: "short", headwear: "none" } },
    { position: 9, name: "LeoStack", title: "Ranger Full-Stack", level: 37, badges: ["streak"], exp: "10.980", progress: 49, appearance: { hair: "dapper", shirt: "short", headwear: "cowboyHat" } },
    { position: 10, name: "JulioAPI", title: "Alquimista de APIs", level: 34, badges: ["arcane", "guardian"], exp: "9.650", progress: 42, appearance: { hair: "bob", shirt: "shortBoobs", headwear: "none" } },
];
