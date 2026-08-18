import { Card } from "@/components/ui/Card";
import { DeadlineIcon, DoneIcon, PdfEvidenceIcon, PendingIcon, PhotoEvidenceIcon, SparkIcon } from "@/components/icons";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { MuralMission } from "@/types/mission";
import { daysUntil, formatDate } from "@/utils/date";

/** Verde para concluídas, amarelo para aguardando: cores semânticas pedidas na FE-05. */
const stateBadge = {
    disponiveis: { label: "Disponível", Icon: SparkIcon, className: "border-primary bg-primary-overlay text-primary-light" },
    aguardando: { label: "Aguardando", Icon: PendingIcon, className: "border-primary-dark bg-primary-overlay text-primary" },
    concluidas: { label: "Concluída", Icon: DoneIcon, className: "border-green bg-green-overlay text-green-light" },
} as const;

/**
 * Papéis pregados à mão nunca ficam retos. A inclinação vem da posição no grid — e não de um
 * sorteio — para o mesmo card não dançar a cada render.
 */
const tilts = ["-rotate-[1.4deg]", "rotate-[.9deg]", "-rotate-[.6deg]", "rotate-[1.5deg]", "-rotate-[1deg]", "rotate-[.5deg]"] as const;

/** O prazo só vira alerta enquanto a missão ainda depende do colaborador. */
const URGENT_THRESHOLD_IN_DAYS = 3;

function deadlineLabel(remainingDays: number) {
    if (remainingDays < 0) return "Prazo encerrado";
    if (remainingDays === 0) return "Encerra hoje";
    if (remainingDays === 1) return "Encerra amanhã";
    return `Encerra em ${remainingDays} dias`;
}

export function MuralMissionCard({ mission, index = 0 }: { mission: MuralMission; index?: number }) {
    const badge = stateBadge[mission.state];
    const BadgeIcon = badge.Icon;
    const EvidenceIcon = mission.evidenceType === "PDF" ? PdfEvidenceIcon : PhotoEvidenceIcon;
    const remainingDays = daysUntil(mission.deadline);
    const urgent = mission.state === "disponiveis" && remainingDays <= URGENT_THRESHOLD_IN_DAYS;

    return (
        // Ao passar o mouse o papel se endireita e sobe, como se fosse tirado do prego.
        <div className={cn("h-full transition duration-200 hover:z-10 hover:-translate-y-1 hover:rotate-0", tilts[index % tilts.length])}>
            <Card as="article" className={cn("relative flex h-full flex-col gap-4 p-5 pt-9 shadow-[5px_6px_0_rgb(15_14_14/55%)]", HALL_PANEL)}>
                <span aria-hidden="true" className="absolute left-1/2 top-2.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-(--color-black) bg-primary shadow-[inset_-1px_-1px_0_var(--color-primary-dark),0_2px_0_var(--color-black)]" />

                <header className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-[1.02rem] font-black leading-tight text-primary-light">{renderTextWithNumericFont(mission.title)}</h3>
                    <span className={cn("flex shrink-0 items-center gap-1.5 border-2 px-2 py-1 text-[9px] font-black uppercase tracking-[.12em]", badge.className)}>
                        <BadgeIcon className="h-3.5 w-3.5" />
                        {badge.label}
                    </span>
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
                            <EvidenceIcon className="h-3.5 w-3.5" /> Evidência
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
            </Card>
        </div>
    );
}
