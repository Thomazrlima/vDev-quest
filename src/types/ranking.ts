import type { ManaSeedAppearance } from "@/types/character";

export type RankingBadgeType = "champion" | "guardian" | "arcane" | "streak";

type RankingPlayer = {
    name: string;
    title: string;
    level: number;
    badges: RankingBadgeType[];
    exp: string;
    appearance: ManaSeedAppearance;
};

export type RankingLeader = RankingPlayer & {
    position: 1 | 2 | 3;
};

export type RankingEntry = RankingPlayer & {
    position: number;
    progress: number;
};
