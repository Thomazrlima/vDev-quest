import { AlertIcon, PendingIcon } from "@/components/icons";
import { Alert } from "@/components/ui/Alert";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { MuralMission } from "@/types/mission";
import { formatDate } from "@/utils/date";
import { openRefusal, pendingSubmission } from "@/utils/mural";

/** O que o gestor respondeu por último: a conquista, a espera ou a recusa que pede reenvio. */
export function MissionVerdict({ mission }: { mission: MuralMission }) {
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
