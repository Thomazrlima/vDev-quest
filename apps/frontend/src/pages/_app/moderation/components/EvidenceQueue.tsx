import { ChevronIcon, ScrollIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import type { EvidenceSubmission } from "@/types/moderation";
import { formatDate } from "@/utils/date";
import { renderTextWithNumericFont } from "@/lib/typography";

export function EvidenceQueue({ evidences, loading, onOpen, emptyTitle = "Nenhuma pendência encontrada", emptyDescription = "Ajuste ou limpe os filtros para consultar a fila completa." }: { evidences: EvidenceSubmission[]; loading: boolean; onOpen: (id: string) => void; emptyTitle?: string; emptyDescription?: string }) {
    if (loading) return <Loading message="Buscando evidências pendentes..." />;
    if (!evidences.length)
        return (
            <div className="p-10 text-center">
                <ScrollIcon className="mx-auto mb-3 h-8 w-8 text-primary-dark" />
                <strong className="block text-sm font-black text-primary-light">{emptyTitle}</strong>
                <span className="mt-1 block text-xs text-white-muted">{emptyDescription}</span>
            </div>
        );
    return (
        <div>
            <div className="hidden grid-cols-[1.1fr_1.25fr_.8fr_.8fr_auto] gap-4 border-b-2 border-primary-dark bg-black px-7 py-4 text-[.7rem] font-black uppercase tracking-[.15em] text-primary-light md:grid" role="row">
                <span>Colaborador</span>
                <span>Missão</span>
                <span>Evidência</span>
                <span>Submetida em</span>
                <span>Status</span>
            </div>
            {evidences.map((evidence) => (
                <Button key={evidence.id} type="button" onClick={() => onOpen(evidence.id)} variant="ghost" className="group w-full justify-start gap-4 border-b border-primary-dark px-5 py-5 text-left transition odd:bg-black-soft even:bg-black-muted last:border-b-0 hover:bg-primary-overlay focus:bg-primary-overlay focus:outline-none md:grid md:grid-cols-[1.1fr_1.25fr_.8fr_.8fr_auto] md:items-center md:px-7">
                    <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-primary-dark bg-black text-[10px] font-black text-primary">{evidence.collaborator.initials}</span>
                        <span>
                            <strong className="block text-[.98rem] font-black text-primary-light">{renderTextWithNumericFont(evidence.collaborator.name)}</strong>
                            <small className="mt-1 block text-[.65rem] font-black uppercase tracking-[.08em] text-primary md:hidden">{renderTextWithNumericFont(evidence.missionTitle)}</small>
                        </span>
                    </span>
                    <span className="hidden text-xs font-bold text-primary-light md:block">{renderTextWithNumericFont(evidence.missionTitle)}</span>
                    <span className="text-xs text-white-muted">{renderTextWithNumericFont(evidence.evidenceType)}</span>
                    <time className="text-xs text-white-muted">{renderTextWithNumericFont(formatDate(evidence.submittedAt))}</time>
                    <span className="flex items-center justify-between gap-3">
                        <strong className={evidence.status === "Aprovada" ? "border-2 border-green bg-green-overlay px-2 py-1 text-[9px] uppercase tracking-wider text-green-light" : evidence.status === "Recusada" ? "border-2 border-red bg-red-overlay px-2 py-1 text-[9px] uppercase tracking-wider text-red-light" : "border-2 border-primary-dark bg-black px-2 py-1 text-[9px] uppercase tracking-wider text-primary-light"}>{evidence.status}</strong>
                        <ChevronIcon className="h-4 w-4 text-primary transition group-hover:text-primary-light" />
                    </span>
                </Button>
            ))}
        </div>
    );
}
