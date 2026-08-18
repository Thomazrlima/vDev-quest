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

/**
 * Papéis pregados à mão nunca ficam retos. A inclinação vem da posição no grid — e não de um
 * sorteio — para o mesmo card não dançar a cada render.
 */
const tilts = ["-rotate-[1.4deg]", "rotate-[.9deg]", "-rotate-[.6deg]", "rotate-[1.5deg]", "-rotate-[1deg]", "rotate-[.5deg]"] as const;

/** O que espera o colaborador do outro lado do clique muda com o estado da missão. */
const callToAction = {
    disponiveis: "Enviar evidência",
    aguardando: "Ver minhas submissões",
    concluidas: "Ver conquista",
} as const;

export function MuralMissionCard({ mission, index = 0 }: { mission: MuralMission; index?: number }) {
    const state = muralStateOf(mission);
    const refusal = openRefusal(mission);
    const remainingDays = daysUntil(mission.deadline);
    const urgent = isDeadlineUrgent(state, remainingDays);

    return (
        // Ao passar o mouse o papel se endireita e sobe, como se fosse tirado do prego.
        <Link to="/mural/$id" params={{ id: mission.id }} aria-label={`Abrir a missão ${mission.title}`} className={cn("group block h-full transition duration-200 hover:z-10 hover:-translate-y-1 hover:rotate-0 focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-light", tilts[index % tilts.length])}>
            <Card as="article" className={cn("relative flex h-full flex-col gap-4 p-5 pt-9 shadow-[5px_6px_0_rgb(15_14_14/55%)]", HALL_PANEL)}>
                <span aria-hidden="true" className="absolute left-1/2 top-2.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-(--color-black) bg-primary shadow-[inset_-1px_-1px_0_var(--color-primary-dark),0_2px_0_var(--color-black)]" />

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
                    <div className="flex items-center justify-between gap-3">
                        <dt className="flex items-center gap-1.5 text-primary">
                            <EvidenceIcon type={mission.evidenceType} className="h-3.5 w-3.5" /> Evidência
                        </dt>
                        <dd className="normal-case tracking-normal text-white-muted">{renderTextWithNumericFont(mission.evidenceType)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className={cn("flex items-center gap-1.5", urgent ? "text-(--color-orange-light)" : "text-primary")}>
                            <DeadlineIcon className="h-3.5 w-3.5" /> Prazo
                        </dt>
                        <dd className={cn("text-right", urgent ? "text-(--color-orange-light)" : "text-primary-light")}>
                            {renderTextWithNumericFont(formatDate(mission.deadline, "dd/MM/yyyy"))}
                            <span className={cn("mt-0.5 block text-[.58rem] tracking-[.1em]", urgent ? "text-(--color-orange)" : "text-white-muted")}>{renderTextWithNumericFont(deadlineLabel(remainingDays))}</span>
                        </dd>
                    </div>
                </dl>

                <div className="grid gap-2 border-t-2 border-primary-dark pt-3">
                    {/* A recusa em aberto é o que faz o colaborador voltar ao papel: ela vem antes do convite. */}
                    {refusal ? (
                        <p className="flex items-center gap-1.5 text-[.6rem] font-black uppercase tracking-[.1em] text-red-light">
                            <AlertIcon className="h-3.5 w-3.5 shrink-0" /> Última submissão recusada
                        </p>
                    ) : null}
                    <span aria-hidden="true" className="flex items-center gap-1.5 text-[.6rem] font-black uppercase tracking-[.12em] text-primary transition group-hover:text-primary-light">
                        {refusal ? "Reenviar evidência" : callToAction[state]}
                        <ChevronIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                </div>
            </Card>
        </Link>
    );
}
