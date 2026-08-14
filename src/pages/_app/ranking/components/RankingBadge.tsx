import { CrownIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { cn } from "@/lib/tailwind";
import type { RankingBadgeType } from "@/types/ranking";

const badgeDetails = {
    champion: { label: "Campeão da temporada", Icon: CrownIcon },
    guardian: { label: "Guardião da guilda", Icon: ShieldIcon },
    arcane: { label: "Mestre arcano", Icon: SparkIcon },
    streak: { label: "Sequência lendária", Icon: SparkIcon },
} as const;

export function RankingBadge({ badge, compact = false }: { badge: RankingBadgeType; compact?: boolean }) {
    const { label, Icon } = badgeDetails[badge];

    return (
        <span
            className={cn(
                "inline-grid h-7.5 w-7.5 shrink-0 place-items-center rounded-full border-2 shadow-[inset_2px_2px_0_var(--color-white-overlay),2px_2px_0_var(--color-black)] [&_svg]:h-4 [&_svg]:w-4",
                compact && "h-5.25 w-5.25 border shadow-[1px_1px_0_var(--color-black)] [&_svg]:h-3 [&_svg]:w-3",
                badge === "champion" && "border-[var(--color-orange)] bg-[var(--color-orange-dark)] text-[var(--color-primary)]",
                badge === "guardian" && "border-[var(--color-blue)] bg-[var(--color-blue-dark)] text-[var(--color-blue-light)]",
                badge === "arcane" && "border-[var(--color-purple)] bg-[var(--color-purple-dark)] text-[var(--color-purple-light)]",
                badge === "streak" && "border-[var(--color-orange)] bg-[var(--color-orange-dark)] text-[var(--color-orange)]",
                !badge && "border-[var(--color-orange-dark)] bg-[var(--color-black)] text-[var(--color-primary)]",
            )}
            title={label}
            aria-label={label}
        >
            <Icon />
        </span>
    );
}
