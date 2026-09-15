import { Link } from "@tanstack/react-router";
import { ChevronIcon, EvidenceIcon } from "@/components/icons";
import { EvidenceValue } from "@/components/Mission/EvidenceValue";
import { SubmissionStatusBadge } from "@/components/Mission/SubmissionStatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { FeedEntry } from "@/types/mission";
import { formatDate } from "@/utils/date";
import { isPhotoSubmission } from "@/utils/mural";

/** A entrega aberta em tamanho de leitura: a evidência, o veredito que ela recebeu e o caminho de volta à missão. */
export function FeedPost({ entry, onClose }: { entry: FeedEntry; onClose: () => void }) {
    const { mission, submission } = entry;

    return (
        <Modal open title={mission.title} description={`${mission.evidenceType} · enviada em ${formatDate(submission.submittedAt, "full")}`} onClose={onClose} className="w-[min(680px,calc(100vw-2rem))]">
            <div className="grid gap-5 bg-black-overlay p-5 sm:p-6">
                {isPhotoSubmission(submission) ? (
                    <figure className="grid gap-2">
                        <img src={submission.preview} alt={`Evidência enviada para a missão ${mission.title}`} className="max-h-[46vh] w-full border-2 border-primary-dark bg-(--color-black) object-contain" />
                        <figcaption className="flex items-center gap-2 text-[.65rem] text-white-muted">
                            <EvidenceIcon type={mission.evidenceType} aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="break-all">{submission.value}</span>
                        </figcaption>
                    </figure>
                ) : (
                    <div className="flex items-start gap-2.5 border-2 border-primary-dark bg-(--color-black) p-4">
                        <EvidenceIcon type={mission.evidenceType} aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <EvidenceValue submission={submission} className="min-w-0 flex-1" />
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-primary-dark pt-4">
                    <SubmissionStatusBadge status={submission.status} />
                    <span className="text-[.7rem] font-black uppercase tracking-[.1em] text-primary-light">{renderTextWithNumericFont(`+${mission.xp} EXP`)}</span>
                </div>

                {submission.justification ? (
                    <div className="border-l-4 border-red bg-red-overlay px-3 py-2">
                        <p className="text-[.6rem] font-black uppercase tracking-[.1em] text-red-light">Justificativa do gestor</p>
                        <p className="mt-1 text-xs leading-relaxed text-white-soft">{renderTextWithNumericFont(submission.justification)}</p>
                    </div>
                ) : null}

                <p className="text-xs leading-relaxed text-white-muted">{renderTextWithNumericFont(mission.description)}</p>
            </div>

            <div className="flex justify-end border-t-2 border-primary-dark bg-black px-5 py-4 sm:px-6">
                <Button asChild className="px-4 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                    <Link to="/mural/$id" params={{ id: mission.id }}>
                        Abrir a missão <ChevronIcon className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </Modal>
    );
}
