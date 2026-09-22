import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronIcon, ScrollIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DetailCard } from "@/components/ui/DetailCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Loading } from "@/components/ui/Loading";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";
import { TextArea } from "@/components/ui/TextArea";
import { cn } from "@/lib/tailwind";
import { moderationService } from "@/api/moderation";
import { formatDate } from "@/utils/date";

export const Route = createFileRoute("/_app/moderation/$id/")({
    component: EvidenceDetailsPage,
});

function EvidenceDetailsPage() {
    const { id: evidenceId } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: evidence, isPending: loading, error: loadError, refetch } = useQuery({ queryKey: ["admin", "submission", evidenceId], queryFn: () => moderationService.getById(evidenceId) });
    const [previewOpen, setPreviewOpen] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [justification, setJustification] = useState("");
    const [justificationError, setJustificationError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    async function reject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!evidence) return;
        if (!justification.trim()) {
            setJustificationError("Informe o motivo da invalidação.");
            return;
        }

        setSaving(true);
        setJustificationError(null);
        setNotice(null);
        try {
            await moderationService.invalidate(evidence.id, justification);
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["admin"] }), queryClient.invalidateQueries({ queryKey: ["mural"] }), queryClient.invalidateQueries({ queryKey: ["profile"] }), queryClient.invalidateQueries({ queryKey: ["ranking"] })]);
            await refetch();
            setRejecting(false);
            setNotice("Submissão invalidada e EXP revertida.");
        } catch (error) {
            setNotice(error instanceof Error ? error.message : "Não foi possível invalidar a submissão.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            <StoneWall>
                <div className="mx-auto w-[min(768px,100%)]">
                    <Button variant="ghost" onClick={() => navigate({ to: "/moderation" })} className="mb-7 p-0 text-[11px] text-primary hover:text-primary-light">
                        <ChevronIcon className="h-4 w-4 rotate-180" /> Consulta de entregas
                    </Button>
                    {loading ? (
                        <Card className={HALL_PANEL}>
                            <Loading message="Carregando evidência..." />
                        </Card>
                    ) : !evidence ? (
                        <Card className={cn("p-8 text-center", HALL_PANEL)}>
                            <p role={loadError ? "alert" : undefined} className="text-sm text-primary-light">{loadError?.message ?? "Evidência não encontrada."}</p>
                        </Card>
                    ) : (
                        <Card className={cn("overflow-hidden", HALL_PANEL)}>
                            <div className="border-b-2 border-primary-dark bg-black p-6">
                                <Eyebrow>Detalhe da evidência</Eyebrow>
                                <Heading className="mt-2">Entrega de {evidence.collaborator.name}</Heading>
                                <p className="mt-2 text-sm text-white-muted">{`Registro ${evidence.status.toLocaleLowerCase("pt-BR")} para a missão “${evidence.missionTitle}”.`}</p>
                            </div>
                            <div className="grid gap-5 bg-black-overlay p-6 sm:grid-cols-2">
                                <DetailCard label="Missão" value={evidence.missionTitle} />
                                <DetailCard label="Tipo enviado" value={evidence.evidenceType} />
                                <DetailCard label={evidence.evidenceType === "Link" || evidence.evidenceType === "Texto" ? "Evidência" : "Arquivo"} value={evidence.fileName} />
                                <DetailCard label="Submetida em" value={formatDate(evidence.submittedAt, "full")} />
                            </div>
                            {evidence.evidenceType === "Foto (PNG, JPEG)" && evidence.previewUrl ? (
                                <div className="border-t-2 border-primary-dark bg-black-overlay p-6">
                                    <h2 className="text-[11px] font-black uppercase tracking-[.14em] text-primary-light">Prévia da evidência</h2>
                                    <button type="button" onClick={() => setPreviewOpen(true)} className="group mt-3 block w-full overflow-hidden border-2 border-primary-dark bg-black text-left focus:outline-none focus-visible:border-primary" aria-label={`Ampliar imagem ${evidence.fileName}`}>
                                        <img src={evidence.previewUrl} alt={`Prévia de ${evidence.fileName}, enviada por ${evidence.collaborator.name}`} className="h-64 w-full object-cover transition duration-200 group-hover:scale-[1.02]" />
                                        <span className="block border-t-2 border-primary-dark px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] text-primary-light">Clique para ampliar</span>
                                    </button>
                                </div>
                            ) : null}
                            {evidence.evidenceType === "PDF" && evidence.previewUrl ? (
                                <div className="border-t-2 border-primary-dark bg-black-overlay p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h2 className="text-[11px] font-black uppercase tracking-[.14em] text-primary-light">Prévia do PDF</h2>
                                        <a href={evidence.previewUrl} target="_blank" rel="noreferrer" className="border-2 border-primary-dark bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-primary-light transition hover:border-primary">Abrir em outra aba</a>
                                    </div>
                                    <object data={evidence.previewUrl} type="application/pdf" aria-label={`Prévia do PDF ${evidence.fileName}`} className="mt-3 h-[32rem] w-full border-2 border-primary-dark bg-white">
                                        <p className="p-5 text-sm text-black">Não foi possível exibir a prévia. <a href={evidence.previewUrl} target="_blank" rel="noreferrer" className="font-bold underline">Abra o PDF em outra aba.</a></p>
                                    </object>
                                </div>
                            ) : null}
                            <div className="border-t-2 border-primary-dark bg-black p-6">
                                {evidence.status === "Ativa" ? (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <Button type="button" variant="secondary" onClick={() => setRejecting(true)} disabled={saving} className="px-5 text-[10px]">Invalidar submissão</Button>
                                    </div>
                                ) : (
                                    <div className="text-xs text-white-muted">
                                        <p><ScrollIcon className="mr-2 inline h-4 w-4 text-primary" /> Evidência <strong className="text-primary-light">{evidence.status.toLocaleLowerCase("pt-BR")}</strong>{evidence.reviewedAt ? ` em ${formatDate(evidence.reviewedAt, "full")}` : ""}.</p>
                                        {evidence.justification ? <p className="mt-3 border-l-2 border-(--color-orange) pl-3 leading-relaxed text-(--color-orange-light)">{evidence.justification}</p> : null}
                                    </div>
                                )}
                                {notice ? <p role="status" className="mt-4 text-xs font-bold text-green-light">{notice}</p> : null}
                            </div>
                        </Card>
                    )}
                </div>
            </StoneWall>
            {evidence?.previewUrl && previewOpen ? (
                <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-5" role="presentation">
                    <section role="dialog" aria-modal="true" aria-labelledby="evidence-preview-title" className="max-h-full w-full max-w-5xl overflow-auto border-2 border-primary bg-black shadow-[6px_6px_0_var(--color-primary-dark)]">
                        <div className="flex items-center justify-between gap-4 border-b-2 border-primary-dark p-4">
                            <h2 id="evidence-preview-title" className="truncate text-xs font-black uppercase tracking-[.12em] text-primary-light">{evidence.fileName}</h2>
                            <Button type="button" variant="secondary" onClick={() => setPreviewOpen(false)} className="shrink-0 px-4 py-2 text-[10px]">Fechar</Button>
                        </div>
                        <img src={evidence.previewUrl} alt={`Imagem ampliada de ${evidence.fileName}, enviada por ${evidence.collaborator.name}`} className="max-h-[calc(100vh-10rem)] w-full object-contain" />
                    </section>
                </div>
            ) : null}
            {evidence && rejecting ? (
                <div className="fixed inset-0 z-[110] grid place-items-center bg-black/85 p-5" role="presentation">
                    <form onSubmit={reject} noValidate role="dialog" aria-modal="true" aria-labelledby="reject-evidence-title" className="w-full md:w-[42rem] border-2 border-(--color-orange) bg-black shadow-[6px_6px_0_var(--color-orange-dark)]">
                        <div className="border-b-2 border-(--color-orange-dark) bg-orange-overlay p-5">
                            <h2 id="reject-evidence-title" className="text-sm font-black uppercase tracking-[.12em] text-(--color-orange-light)">Invalidar submissão</h2>
                            <p className="mt-2 text-xs leading-relaxed text-(--color-orange-light)">A EXP desta submissão será revertida. Registre a justificativa para a auditoria.</p>
                        </div>
                        <div className="p-5">
                            <TextArea label="Justificativa" value={justification} onChange={(event) => { setJustification(event.target.value); setJustificationError(null); }} error={justificationError ?? undefined} placeholder="Descreva o motivo da invalidação..." rows={5} required />
                        </div>
                        <div className="flex flex-col-reverse gap-3 border-t-2 border-primary-dark p-5 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" onClick={() => { setRejecting(false); setJustificationError(null); }} disabled={saving} className="px-5 text-[10px]">Cancelar</Button>
                            <Button type="submit" disabled={saving} className="px-5 text-[10px]">{saving ? "Salvando" : "Confirmar invalidação"}</Button>
                        </div>
                    </form>
                </div>
            ) : null}
        </main>
    );
}
