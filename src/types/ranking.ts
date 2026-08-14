import type { ManaSeedAppearance } from "@/types/character";

export type RankingBadgeType = "champion" | "guardian" | "arcane" | "streak";

type RankingPlayer = {
    name: string;
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
    title: string;
    progress: number;
};
