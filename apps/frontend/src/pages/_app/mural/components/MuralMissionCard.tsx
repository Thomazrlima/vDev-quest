import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { AlertIcon, ChevronIcon, DeadlineIcon, EvidenceIcon, SparkIcon } from "@/components/icons";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { MuralStateBadge } from "./MuralStateBadge";
import type { MuralMission } from "@/types/mission";
import { daysUntil, formatDate } from "@/utils/date";
import { deadlineLabel, isDeadlineUrgent, muralStateOf, openRefusal } from "@/utils/mural";

/** O que espera o colaborador do outro lado do clique muda com o estado da missão. */
const callToAction = {
    disponiveis: "Enviar evidência",
    aguardando: "Enviar próxima fase",
    recusadas: "Ver histórico",
    concluidas: "Ver conquista",
} as const;

export function MuralMissionCard({ mission }: { mission: MuralMission; index?: number }) {
    const state = muralStateOf(mission);
    const refusal = openRefusal(mission);
    const remainingDays = daysUntil(mission.deadline);
    const urgent = isDeadlineUrgent(state, remainingDays);

    return (
        <Link to="/mural/$id" params={{ id: mission.id }} aria-label={`Abrir a missão ${mission.title}`} className="group block h-full transition duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-light">
            <Card as="article" className={cn("relative flex h-full flex-col gap-4 overflow-hidden p-5 transition duration-200 group-hover:border-primary", HALL_PANEL)}>
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />

                <header className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-[1.02rem] font-black leading-tight text-primary-light">{renderTextWithNumericFont(mission.title)}</h3>
                    <MuralStateBadge state={state} />
                </header>

                <p className="line-clamp-3 text-xs leading-relaxed text-white-muted">{renderTextWithNumericFont(mission.description)}</p>

                <dl className="mt-auto grid gap-2.5 border-t-2 border-primary-dark pt-4 text-[.65rem] font-black uppercase tracking-[.08em]">
                    <div className="flex items-center justify-between gap-3">
                        <dt className="flex items-center gap-1.5 text-primary">
                            <SparkIcon className="h-3.5 w-3.5" /> Recompensa
                        </dt>
                        <dd className="text-[.85rem] text-primary-light">{renderTextWithNumericFont(`${mission.xp} EXP`)}</dd>
                    </div>
                    {mission.nextPhaseTitle && (state === "disponiveis" || state === "aguardando") ? (
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-primary">Próxima fase</dt>
                            <dd className="text-right normal-case tracking-normal text-primary-light">{renderTextWithNumericFont(mission.nextPhaseTitle)}</dd>
                        </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-3">
                        <dt className="flex items-center gap-1.5 text-primary">
                            <EvidenceIcon type={mission.evidenceType} className="h-3.5 w-3.5" /> Evidência
                        </dt>
                        <dd className="normal-case tracking-normal text-white-muted">{renderTextWithNumericFont(mission.evidenceType)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className={cn("flex items-center gap-1.5", urgent ? "text-(--color-danger-light)" : "text-primary")}>
                            <DeadlineIcon className="h-3.5 w-3.5" /> Prazo
                        </dt>
                        <dd className={cn("text-right", urgent ? "text-(--color-danger-light)" : "text-primary-light")}>
                            {renderTextWithNumericFont(formatDate(mission.deadline, "dd/MM/yyyy"))}
                            <span className={cn("mt-0.5 block text-[.58rem] tracking-[.1em]", urgent ? "text-(--color-danger)" : "text-white-muted")}>{renderTextWithNumericFont(deadlineLabel(remainingDays))}</span>
                        </dd>
                    </div>
                </dl>

                <div className="grid gap-2 border-t-2 border-primary-dark pt-3">
                    {/* A recusa em aberto é o que faz o colaborador voltar ao papel: ela vem antes do convite. */}
                    {refusal ? (
                        <p className="flex items-center gap-1.5 text-[.6rem] font-black uppercase tracking-[.1em] text-red-light">
                            <AlertIcon className="h-3.5 w-3.5 shrink-0" /> Última submissão invalidada
                        </p>
                    ) : null}
                    <span aria-hidden="true" className="flex items-center gap-1.5 text-[.6rem] font-black uppercase tracking-[.12em] text-primary transition group-hover:text-primary-light">
                        {callToAction[state]}
                        <ChevronIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                </div>
            </Card>
        </Link>
    );
}
