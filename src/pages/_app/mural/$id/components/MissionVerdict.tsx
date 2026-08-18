import { AlertIcon, PendingIcon, TrophyIcon } from "@/components/icons";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { MuralMission } from "@/types/mission";
import { formatDate } from "@/utils/date";
import { approvedSubmission, openRefusal, pendingSubmission } from "@/utils/mural";

/** O que o gestor respondeu por último: a conquista, a espera ou a recusa que pede reenvio. */
export function MissionVerdict({ mission }: { mission: MuralMission }) {
    const approved = approvedSubmission(mission);
    if (approved) {
        return (
            <Card as="section" className="border-4 border-green bg-green-overlay px-6 py-8 text-center shadow-[5px_6px_0_rgb(15_14_14/55%)]">
                <span aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center border-2 border-green bg-black text-green-light">
                    <TrophyIcon className="h-8 w-8" />
                </span>
                <strong className="mt-4 block text-base font-black uppercase tracking-[.1em] text-green-light">Missão concluída</strong>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white-muted">{renderTextWithNumericFont(approved.reviewedAt ? `O gestor aprovou sua entrega em ${formatDate(approved.reviewedAt, "short")}.` : "O gestor aprovou sua entrega.")}</p>
                <p className="mt-4 text-2xl font-black text-green-light">{renderTextWithNumericFont(`+${mission.xp} EXP`)}</p>
            </Card>
        );
    }

    const pending = pendingSubmission(mission);
    if (pending) {
        return (
            <Alert tone="info" title="Entrega em análise" icon={<PendingIcon className="h-4 w-4" />}>
                {renderTextWithNumericFont(`A submissão enviada em ${formatDate(pending.submittedAt)} aguarda o veredito do gestor. Até lá, esta missão não recebe uma nova entrega.`)}
            </Alert>
        );
    }

    const refusal = openRefusal(mission);
    if (refusal) {
        return (
            <Alert tone="error" title="Última submissão recusada" icon={<AlertIcon className="h-4 w-4" />}>
                <p>{renderTextWithNumericFont(refusal.justification ?? "O gestor não registrou uma justificativa para esta recusa.")}</p>
                <p className="mt-2 text-red-light/75">{renderTextWithNumericFont(refusal.reviewedAt ? `Recusada em ${formatDate(refusal.reviewedAt, "short")}. Ajuste o que foi apontado e envie uma nova submissão abaixo.` : "Ajuste o que foi apontado e envie uma nova submissão abaixo.")}</p>
            </Alert>
        );
    }

    return null;
}
