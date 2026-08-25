import { EvidenceIcon } from "@/components/icons";
import { SubmissionStatusBadge } from "@/components/Mission/SubmissionStatusBadge";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { SUBMISSION_STATUS_LABELS, type FeedEntry } from "@/types/mission";
import { formatDate } from "@/utils/date";
import { isPhotoSubmission } from "@/utils/mural";

/**
 * Um quadrado do mosaico: a foto entregue quando existe, o conteúdo da evidência quando não.
 * O nome da missão fica sempre visível — no celular não há passar o mouse para descobri-lo.
 */
export function FeedTile({ entry, onOpen }: { entry: FeedEntry; onOpen: () => void }) {
    const { mission, submission } = entry;
    const photo = isPhotoSubmission(submission);

    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label={`Abrir a entrega de ${mission.title}, enviada em ${formatDate(submission.submittedAt)} e ${SUBMISSION_STATUS_LABELS[submission.status].toLocaleLowerCase("pt-BR")}`}
            className={cn("group relative aspect-square cursor-pointer overflow-hidden border-2 border-primary-dark text-left transition duration-200 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light", photo ? "bg-black" : "bg-card")}
        >
            {photo ? <img src={submission.preview} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : null}

            <SubmissionStatusBadge status={submission.status} compact className="absolute right-1.5 top-1.5 z-10 bg-black-overlay" />

            <span className="relative flex h-full flex-col p-2.5">
                {photo ? null : (
                    <>
                        <EvidenceIcon type={mission.evidenceType} aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
                        <p className={cn("mt-2 line-clamp-3 text-[.6rem] leading-relaxed text-white-soft", submission.kind !== "text" && "break-all font-bold text-primary-light")}>{submission.value}</p>
                    </>
                )}

                {/* O nome da missão fecha o quadrado; sobre a foto ele ganha um véu para continuar legível. */}
                <span className={cn("mt-auto flex flex-col gap-0.5 pt-6", photo && "-mx-2.5 -mb-2.5 bg-gradient-to-t from-black via-black-overlay to-transparent px-2.5 pb-2.5")}>
                    <span className="line-clamp-2 text-[.6rem] font-black uppercase leading-tight tracking-[.06em] text-primary-light">{renderTextWithNumericFont(mission.title)}</span>
                    <span className="text-[.55rem] font-black uppercase tracking-[.1em] text-primary opacity-0 transition duration-200 group-focus-visible:opacity-100 group-hover:opacity-100">{renderTextWithNumericFont(`+${mission.xp} EXP`)}</span>
                </span>
            </span>
        </button>
    );
}
