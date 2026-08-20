import { DeadlineIcon, EvidenceIcon, SparkIcon, TrophyIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { DetailCard } from "@/components/ui/DetailCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { MuralStateBadge } from "../../components/MuralStateBadge";
import type { MuralMission } from "@/types/mission";
import { daysUntil, formatDate } from "@/utils/date";
import { deadlineLabel, isDeadlineUrgent, muralStateOf } from "@/utils/mural";

/** A ficha da missão: o que fazer, quanto vale, até quando e que prova a guilda espera. */
export function MissionBriefing({ mission }: { mission: MuralMission }) {
    const state = muralStateOf(mission);
    const remainingDays = daysUntil(mission.deadline);
    const urgent = isDeadlineUrgent(state, remainingDays);

    return (
        <Card as="article" className={cn("overflow-hidden", HALL_PANEL)}>
            <header className="border-b-2 border-primary-dark bg-black p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Eyebrow>Mural de missões · FE-06</Eyebrow>
                    <div className="flex items-center gap-2">
                        {state === "concluidas" ? <TrophyIcon aria-label="Troféu da missão concluída" className="h-5 w-5 text-green-light" /> : null}
                        <MuralStateBadge state={state} />
                    </div>
                </div>
                <Heading className="mt-2" size="sm">
                    {mission.title}
                </Heading>
                <p className="mt-3 text-sm leading-relaxed text-white-muted">{renderTextWithNumericFont(mission.description)}</p>
            </header>

            <div className="grid gap-5 bg-black-overlay p-6 sm:grid-cols-3">
                <DetailCard icon={<SparkIcon className="h-3.5 w-3.5" />} label="Recompensa" value={`+${mission.xp} EXP`} valueClassName="text-green-light" />
                <DetailCard icon={<DeadlineIcon className="h-3.5 w-3.5" />} label="Prazo" value={formatDate(mission.deadline, "dd/MM/yyyy")} hint={deadlineLabel(remainingDays)} highlight={urgent} />
                <DetailCard icon={<EvidenceIcon type={mission.evidenceType} className="h-3.5 w-3.5" />} label="Evidência exigida" value={mission.evidenceType} />
            </div>
        </Card>
    );
}
