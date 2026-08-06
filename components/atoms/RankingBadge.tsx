import { CrownIcon, ShieldIcon, SparkIcon } from "@/components/atoms/icons";
import type { RankingBadgeType } from "@/types/ranking";

const badgeDetails = {
  champion: { label: "Campeão da temporada", Icon: CrownIcon },
  guardian: { label: "Guardião da guilda", Icon: ShieldIcon },
  arcane: { label: "Mestre arcano", Icon: SparkIcon },
  streak: { label: "Sequência lendária", Icon: SparkIcon }
} as const;

export function RankingBadge({ badge, compact = false }: { badge: RankingBadgeType; compact?: boolean }) {
  const { label, Icon } = badgeDetails[badge];

  return (
    <span className={`ranking-badge ranking-badge--${badge} ${compact ? "ranking-badge--compact" : ""}`} title={label} aria-label={label}>
      <Icon />
    </span>
  );
}
