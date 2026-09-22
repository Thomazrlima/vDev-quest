import type { BodyType, ManaSeedAppearance, ManaSeedColors } from "@/types/character";

export type RankingBadgeType = "champion" | "guardian" | "arcane" | "streak" | { label: string; imagePath: string };

type RankingPlayer = {
    name: string;
    title: string;
    level: number;
    badges: RankingBadgeType[];
    exp: string;
    appearance: ManaSeedAppearance;
    bodyType: BodyType;
    colors: ManaSeedColors;
};

export type RankingLeader = RankingPlayer & {
    position: 1 | 2 | 3;
};

export type RankingEntry = RankingPlayer & {
    position: number;
    progress: number;
};
