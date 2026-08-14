import { Fragment, useMemo } from "react";
import { ManaSeedSpriteLayers } from "@/components/ManaSeed/ManaSeedSpriteLayers";
import { RankingBadge } from "./RankingBadge";
import { MANA_SEED } from "@/mocks/data/mana-seed";
import type { RankingLeader } from "@/types/ranking";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { Card } from "@/components/ui/Card";
import { getManaSeedLayers } from "@/utils/mana-seed";

const podiumOrder = [2, 1, 3] as const;

const leaderPlacement = {
    1: "left-1/2 bottom-[29.5%] w-[30%] -translate-x-1/2",
    2: "bottom-[18%] left-[4.2%] w-[29%]",
    3: "bottom-[13%] right-[4.2%] w-[29%]",
} as const;

const rankPlacement = {
    1: "left-[49.6%] top-[62%] -translate-x-1/2 max-[760px]:top-[78%]",
    2: "left-[19%] top-[65%] -translate-x-1/2 max-[760px]:top-[78%]",
    3: "left-[81.5%] top-[67%] -translate-x-1/2 max-[760px]:top-[78%]",
} as const;

const rankColor = {
    1: "text-primary",
    2: "text-white-soft",
    3: "text-[#cd7f32]",
} as const;

const cardBorderColor = {
    1: "border-primary",
    2: "border-white-soft !shadow-[0_0_0_2px_var(--color-white-muted),5px_5px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-white-muted)]",
    3: "border-[#cd7f32] !shadow-[0_0_0_2px_#7a351c,5px_5px_0_var(--color-black-overlay),inset_0_0_0_2px_#7a351c]",
} as const;

export function RankingPodium({ leaders }: { leaders: RankingLeader[] }) {
    const portraits = useMemo(() => new Map(leaders.map((leader) => [leader.position, getManaSeedLayers(leader.appearance, leader.bodyType, leader.colors)])), [leaders]);
    const orderedLeaders = podiumOrder.map((position) => leaders.find((leader) => leader.position === position)).filter((leader): leader is RankingLeader => Boolean(leader));

    return (
        <div className="relative z-4 mx-auto mt-2.5 h-[clamp(300px,52vw,530px)] w-full max-w-255" role="list" aria-label="Pódio dos três melhores aventureiros">
            <img src="/images/assets/podio.png" alt="" aria-hidden="true" className="pointer-events-none absolute bottom-[-13.2%] left-0 z-0 w-full select-none [filter:drop-shadow(0_12px_0_var(--color-black-overlay))] [image-rendering:pixelated]" />
            {orderedLeaders.map((leader) => {
                return (
                    <Fragment key={leader.position}>
                        <strong className={cn("pointer-events-none absolute z-3 font-black leading-none text-[clamp(2.6rem,6vw,4.6rem)] drop-shadow-[0_0_10px_currentColor] [text-shadow:3px_3px_0_#0f0e0e,-1px_-1px_0_#f4f4f4] max-[760px]:text-[clamp(2.2rem,10vw,3.2rem)]", rankPlacement[leader.position], rankColor[leader.position])} aria-label={`${leader.position}º lugar`}>
                            {renderTextWithNumericFont(leader.position)}
                        </strong>
                        <article className={cn("absolute flex flex-col items-center text-center", leaderPlacement[leader.position])} role="listitem">
                            <Card className={cn("relative z-2 flex w-[92%] flex-col items-center px-3 py-2 pb-[35px] text-center max-[760px]:w-full max-[760px]:px-1.5 max-[760px]:py-1.5 max-[760px]:pb-[28px]", cardBorderColor[leader.position])}>
                                <strong className="block w-full translate-y-[6px] overflow-hidden truncate text-center text-[clamp(.84rem,1.9vw,1.16rem)] font-black text-primary-light max-[760px]:text-[clamp(.64rem,3.1vw,.82rem)]">{leader.name}</strong>
                                <p className="mt-1 w-full translate-y-[6px] overflow-hidden truncate text-center text-[clamp(.5rem,1vw,.62rem)] font-black uppercase tracking-[.08em] text-primary max-[760px]:text-[clamp(.4rem,1.65vw,.5rem)]">{leader.title}</p>
                                <div className="mt-2 flex w-full translate-y-[6px] items-center justify-center gap-2.5 text-center text-[.8rem] font-black uppercase tracking-[.08em] text-primary-light max-[760px]:mt-1.5 max-[760px]:gap-1.5 max-[760px]:text-[.56rem]">
                                    <span>{renderTextWithNumericFont(`Nível ${leader.level}`)}</span>
                                    <span className="border-l border-primary-light pl-2.5 text-primary-light max-[760px]:pl-1.5">{renderTextWithNumericFont(`${leader.exp} XP`)}</span>
                                </div>
                                <div className="absolute bottom-0 left-1/2 z-[3] flex -translate-x-1/2 translate-y-1/2 items-center justify-center gap-1 max-[760px]:gap-0.5">
                                    {leader.badges.map((badge) => (
                                        <RankingBadge badge={badge} className="h-6.5 w-6.5 [&_svg]:h-3.5 [&_svg]:w-3.5 max-[760px]:h-5.5 max-[760px]:w-5.5 max-[760px]:[&_svg]:h-3 max-[760px]:[&_svg]:w-3" compact key={badge} />
                                    ))}
                                </div>
                            </Card>
                            <div className="relative z-1 -mt-1 -translate-y-2.5 h-[clamp(160px,28vw,295px)] w-[clamp(160px,28vw,295px)] filter-[drop-shadow(7px_8px_0_var(--color-black-overlay))] max-[760px]:h-[clamp(125px,38vw,170px)] max-[760px]:w-[clamp(125px,38vw,170px)]">
                                <ManaSeedSpriteLayers frame={MANA_SEED.staticAvatarFrame} layers={portraits.get(leader.position)} />
                            </div>
                        </article>
                    </Fragment>
                );
            })}
        </div>
    );
}
