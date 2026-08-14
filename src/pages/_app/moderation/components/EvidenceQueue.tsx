import { ChevronIcon, ScrollIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import type { EvidenceSubmission } from "@/types/moderation";
import { formatDate } from "@/utils/date";

export function EvidenceQueue({ evidences, loading, onOpen }: { evidences: EvidenceSubmission[]; loading: boolean; onOpen: (id: string) => void }) {
    if (loading) return <Loading message="Buscando evidências pendentes..." />;
    if (!evidences.length)
        return (
            <div className="p-10 text-center text-sm text-[var(--color-black-muted)]">
                <ScrollIcon className="mx-auto mb-3 h-8 w-8 text-[var(--color-orange-dark)]" />
                <strong className="block text-sm text-[var(--color-orange-light)]">Nenhuma pendência encontrada</strong>
                <span className="mt-1 block text-xs text-[var(--color-black-muted)]">Ajuste ou limpe os filtros para consultar a fila completa.</span>
            </div>
        );
    return (
        <div>
            <header className="hidden grid-cols-[1.1fr_1.25fr_.8fr_.8fr_auto] gap-4 border-b-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] px-7 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--color-black-muted)] md:grid">
                <span>Colaborador</span>
                <span>Missão</span>
                <span>Evidência</span>
                <span>Submetida em</span>
                <span>Status</span>
            </header>
            {evidences.map((evidence) => (
                <Button key={evidence.id} type="button" onClick={() => onOpen(evidence.id)} variant="ghost" className="group w-full gap-4 border-b-2 border-[var(--color-primary-dark)] px-5 py-5 text-left last:border-b-0 hover:bg-[var(--color-primary-dark)] focus:bg-[var(--color-primary-dark)] focus:outline-none md:grid-cols-[1.1fr_1.25fr_.8fr_.8fr_auto] md:items-center md:px-7">
                    <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[var(--color-orange-dark)] bg-[var(--color-orange-dark)] text-[10px] font-black text-primary-light">{evidence.collaborator.initials}</span>
                        <span>
                            <strong className="block text-sm text-[var(--color-orange-light)]">{evidence.collaborator.name}</strong>
                            <small className="mt-1 block text-[10px] text-[var(--color-black-muted)] md:hidden">{evidence.missionTitle}</small>
                        </span>
                    </span>
                    <span className="hidden text-xs font-bold text-[var(--color-primary-light)] md:block">{evidence.missionTitle}</span>
                    <span className="text-xs text-[var(--color-white-muted)]">{evidence.evidenceType}</span>
                    <time className="text-xs text-[var(--color-black-muted)]">{formatDate(evidence.submittedAt)}</time>
                    <span className="flex items-center justify-between gap-3">
                        <strong className="border-2 border-[var(--color-orange-dark)] bg-[var(--color-orange-dark)] px-2 py-1 text-[9px] uppercase tracking-wider text-primary-light">{evidence.status}</strong>
                        <ChevronIcon className="h-4 w-4 text-[var(--color-orange)] transition group-hover:text-primary-light" />
                    </span>
                </Button>
            ))}
        </div>
    );
}
