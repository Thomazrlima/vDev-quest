import type { ReactNode } from "react";
import { EvidenceIcon, ScrollIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { EvidenceValue } from "./EvidenceValue";
import { SubmissionStatusBadge } from "../../components/SubmissionStatusBadge";
import type { MuralMission } from "@/types/mission";
import { formatDate } from "@/utils/date";

const COLUMNS = "md:grid-cols-[minmax(120px,.55fr)_minmax(0,1.75fr)_minmax(110px,auto)]";

/** O histórico de entregas da missão: cada linha é uma submissão, com o veredito que ela recebeu. */
export function SubmissionsTable({ mission, action }: { mission: MuralMission; action?: ReactNode }) {
    const total = mission.submissions.length;

    return (
        <Card as="section" aria-labelledby="minhas-submissoes" className={cn("overflow-hidden", HALL_PANEL)}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary-dark bg-black px-5 py-4 sm:px-7">
                <h2 id="minhas-submissoes" className="text-sm font-black uppercase tracking-[.1em] text-primary-light">
                    Minhas submissões
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-[.65rem] font-black uppercase tracking-[.1em] text-primary">{renderTextWithNumericFont(total === 1 ? "1 envio" : `${total} envios`)}</span>
                    {action}
                </div>
            </header>

            {total === 0 ? (
                <div className="bg-black-overlay p-10 text-center">
                    <ScrollIcon className="mx-auto mb-3 h-8 w-8 text-primary-dark" />
                    <strong className="block text-sm font-black text-primary-light">Nenhuma submissão enviada ainda</strong>
                    <span className="mt-1 block text-xs text-white-muted">Use o botão “Nova evidência” para começar seu histórico nesta missão.</span>
                </div>
            ) : (
                <div className="bg-black-overlay">
                    <div className={cn("hidden gap-4 border-b-2 border-primary-dark bg-black px-7 py-4 text-[.7rem] font-black uppercase tracking-[.15em] text-primary-light md:grid", COLUMNS)} role="row">
                        <span>Envio</span>
                        <span>Evidência</span>
                        <span className="justify-self-end">Status</span>
                    </div>

                    {mission.submissions.map((submission, index) => (
                        <article key={submission.id} className={cn("border-b border-primary-dark px-5 py-4 odd:bg-black-soft even:bg-black-muted last:border-b-0 md:grid md:items-start md:gap-4 md:px-7", COLUMNS)}>
                            <div className="flex items-center justify-between gap-3 md:block">
                                <div>
                                    {/* A lista vem da mais nova para a mais antiga, mas a contagem segue a ordem em que os envios aconteceram. */}
                                    <strong className="block text-[.7rem] font-black uppercase tracking-[.1em] text-primary-light">{renderTextWithNumericFont(`Envio ${String(total - index).padStart(2, "0")}`)}</strong>
                                    <time dateTime={submission.submittedAt} className="mt-1 block text-[.65rem] text-white-muted">
                                        {renderTextWithNumericFont(formatDate(submission.submittedAt))}
                                    </time>
                                </div>
                                <SubmissionStatusBadge status={submission.status} className="md:hidden" />
                            </div>

                            <div className="mt-3 min-w-0 md:mt-0">
                                <div className="flex items-start gap-2.5">
                                    <EvidenceIcon type={mission.evidenceType} aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <EvidenceValue submission={submission} className="min-w-0 flex-1" />
                                </div>

                                {submission.justification ? (
                                    <div className="mt-3 border-l-4 border-red bg-red-overlay px-3 py-2">
                                        <p className="text-[.6rem] font-black uppercase tracking-[.1em] text-red-light">Justificativa do gestor</p>
                                        <p className="mt-1 text-xs leading-relaxed text-white-soft">{renderTextWithNumericFont(submission.justification)}</p>
                                    </div>
                                ) : null}
                            </div>

                            <SubmissionStatusBadge status={submission.status} className="hidden md:inline-flex md:justify-self-end" />
                        </article>
                    ))}
                </div>
            )}
        </Card>
    );
}
