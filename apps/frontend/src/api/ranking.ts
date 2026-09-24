import { api } from "@/api/client";
import type { CursorPage, RankingEntry as ApiRankingEntry } from "@/api/types";
import { DEFAULT_MANA_SEED_COLORS, EMPTY_MANA_SEED_APPEARANCE } from "@/mocks/data/mana-seed";
import type { ManaSeedSlot } from "@/types/character";
import type { RankingEntry, RankingLeader } from "@/types/ranking";

export async function ranking(): Promise<{ leaders: RankingLeader[]; entries: RankingEntry[]; updatedAt: string }> {
    const items: ApiRankingEntry[] = [];
    let cursor: string | null = null;
    do {
        const page: CursorPage<ApiRankingEntry> = await api(`/ranking?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
        items.push(...page.items);
        cursor = page.nextCursor;
    } while (cursor);
    const people = items.map((item) => {
        const appearance = { ...EMPTY_MANA_SEED_APPEARANCE };
        const colors = { ...DEFAULT_MANA_SEED_COLORS, skin: item.avatar.skinColorIndex };
        for (const setting of item.avatar.slots) {
            if (!(setting.slot in appearance)) continue;
            const slot = setting.slot as ManaSeedSlot;
            appearance[slot] = setting.code;
            colors[slot] = setting.colorIndex;
        }
        const progress = typeof item.progress === "number" && Number.isFinite(item.progress) ? item.progress : null;
        const xpToNextLevel = typeof item.xpToNextLevel === "number" && Number.isFinite(item.xpToNextLevel)
            ? item.xpToNextLevel
            : item.xpToNextLevel == null && progress !== null ? null : undefined;
        return {
            position: item.position, name: item.name, title: item.activeTitle ?? item.levelLabel,
            level: item.level, exp: new Intl.NumberFormat("pt-BR").format(item.xp),
            progress, xpToNextLevel,
            badges: item.badges.map((badge) => ({ label: badge.label, imagePath: badge.imagePath ?? "" })),
            bodyType: item.avatar.bodyType, appearance, colors,
        };
    });
    return {
        leaders: people.filter((person) => person.position <= 3) as RankingLeader[],
        entries: people.filter((person) => person.position > 3),
        updatedAt: new Date().toISOString(),
    };
}
