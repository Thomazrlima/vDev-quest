import { CrownIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { cn } from "@/lib/tailwind";
import type { RankingBadgeType } from "@/types/ranking";

const badgeDetails = {
    champion: { label: "Campeão da temporada", Icon: CrownIcon },
    guardian: { label: "Guardião da guilda", Icon: ShieldIcon },
    arcane: { label: "Mestre arcano", Icon: SparkIcon },
    streak: { label: "Sequência lendária", Icon: SparkIcon },
} as const;

export function RankingBadge({ badge, className, compact = false }: { badge: RankingBadgeType; className?: string; compact?: boolean }) {
    const { label, Icon } = badgeDetails[badge];

    return (
        <span
            className={cn(
                "inline-grid h-7.5 w-7.5 shrink-0 place-items-center rounded-full border-2 shadow-[inset_2px_2px_0_var(--color-white-overlay),2px_2px_0_var(--color-black)] [&_svg]:h-4 [&_svg]:w-4",
                compact && "h-5.25 w-5.25 border shadow-[1px_1px_0_var(--color-black)] [&_svg]:h-3 [&_svg]:w-3",
                badge === "champion" && "border-(--color-orange) bg-orange-dark text-primary",
                badge === "guardian" && "border-blue bg-blue-dark text-blue-light",
                badge === "arcane" && "border-purple bg-purple-dark text-purple-light",
                badge === "streak" && "border-(--color-orange) bg-orange-dark text-(--color-orange)",
                !badge && "border-orange-dark bg-(--color-black) text-primary",
                className,
            )}
            title={label}
            aria-label={label}
        >
            <Icon />
        </span>
    );
}
