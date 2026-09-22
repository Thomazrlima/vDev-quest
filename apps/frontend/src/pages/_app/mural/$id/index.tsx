import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronIcon, DoneIcon, UploadIcon } from "@/components/icons";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { BLEED_UNDER_RETURN_LINK, CLEAR_RETURN_LINK, HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { MissionBriefing } from "./components/MissionBriefing";
import { MissionEvidenceForm } from "./components/MissionEvidenceForm";
import { SubmissionsTable } from "./components/SubmissionsTable";
import { muralService } from "@/api/mural";
import { mutationKey } from "@/api/client";
import type { MuralMission } from "@/types/mission";
import { acceptsEvidence, muralStateOf } from "@/utils/mural";

/** O modal explica o que a missão pede — e, se houve recusa, que este envio é o reenvio dela. */
function composerDescription(mission: MuralMission, startsNew: boolean) {
    if (startsNew) return `Esta evidência inicia uma submissão independente pela primeira fase. A missão exige evidência do tipo ${mission.evidenceType}.`;
    return `Esta missão exige evidência do tipo ${mission.evidenceType}. ${mission.nextPhaseTitle ? `Próxima fase: ${mission.nextPhaseTitle}.` : "Cada envio fica registrado no histórico."}`;
}

export const Route = createFileRoute("/_app/mural/$id/")({
    component: MuralMissionPage,
});

function MuralMissionPage() {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: mission, isPending: loading, error: loadError } = useQuery({ queryKey: ["mural", id], queryFn: () => muralService.getById(id) });
    const [submitting, setSubmitting] = useState(false);
    const [composing, setComposing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const submitKey = useRef(mutationKey());
    const selectedSubmissionId = useRef<string | null>(null);
    const [startsNewSubmission, setStartsNewSubmission] = useState(false);
    const lastEvidence = useRef<string | null>(null);

    // De volta ao mural, a aba certa é a de agora: quem acabou de enviar cai em "Aguardando".
    function backToMural() {
        navigate({ to: "/mural", search: { status: mission ? muralStateOf(mission) : "disponiveis" } });
    }

    // Abrir o modal começa uma entrega nova: o erro e o aviso da anterior não vêm junto.
    function openComposer(submissionId: string | null = mission?.submissionId ?? null, startNew = false) {
        setError(null);
        setSent(false);
        submitKey.current = mutationKey();
        selectedSubmissionId.current = submissionId;
        setStartsNewSubmission(startNew);
        lastEvidence.current = null;
        setComposing(true);
    }

    async function submitEvidence(evidence: FormData) {
        const file = evidence.get("file");
        const fingerprint = file instanceof File
            ? `${file.name}:${file.size}:${file.lastModified}:${evidence.get("occurrenceDate") ?? ""}`
            : `${evidence.get("value") ?? ""}:${evidence.get("occurrenceDate") ?? ""}`;
        if (lastEvidence.current !== null && lastEvidence.current !== fingerprint) submitKey.current = mutationKey();
        lastEvidence.current = fingerprint;
        setSubmitting(true);
        setError(null);
        try {
            await muralService.submit(id, evidence, submitKey.current, selectedSubmissionId.current, startsNewSubmission);
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["mural"] }), queryClient.invalidateQueries({ queryKey: ["profile"] }), queryClient.invalidateQueries({ queryKey: ["ranking"] })]);
            setComposing(false);
            setSent(true);
        } catch (problem) {
            setError(problem instanceof Error ? problem.message : "Não foi possível enviar a evidência. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    }

    async function cancelSubmission(submissionId: string) {
        if (!window.confirm("Cancelar esta submissão? A EXP concedida será revertida.")) return;
        setError(null);
        try {
            await muralService.cancel(submissionId);
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["mural"] }), queryClient.invalidateQueries({ queryKey: ["profile"] }), queryClient.invalidateQueries({ queryKey: ["ranking"] })]);
        } catch (problem) {
            setError(problem instanceof Error ? problem.message : "Não foi possível cancelar a submissão.");
        }
    }

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            {/* A mesma tábua do mural: abrir uma missão é tirar o papel do prego, não trocar de lugar. */}
            <section className={cn("flex-1 bg-[linear-gradient(rgb(15_14_14/58%),rgb(15_14_14/58%)),url('/images/backgrounds/mural3.png')] bg-cover bg-fixed bg-center px-4 pb-9 sm:px-6 sm:pb-13", CLEAR_RETURN_LINK)}>
                <div className="mx-auto w-[min(896px,100%)]">
                    <Button variant="ghost" onClick={backToMural} className="mb-7 p-0 text-[11px] text-primary hover:text-primary-light">
                        <ChevronIcon className="h-4 w-4 rotate-180" /> Mural da guilda
                    </Button>

                    {loading ? (
                        <Card className={HALL_PANEL}>
                            <Loading message="Desenrolando o pergaminho da missão..." />
                        </Card>
                    ) : !mission ? (
                        <Card className={cn("p-8 text-center", HALL_PANEL)}>
                            <p className="text-sm text-primary-light">{loadError?.message ?? "Esta missão não está disponível no mural."}</p>
                            <Button onClick={backToMural} className="mt-5 px-5 text-[10px]">
                                Voltar para o mural
                            </Button>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-6">
                                <MissionBriefing mission={mission} />

                                {sent ? (
                                    <Alert tone="success" title="Evidência enviada!" icon={<DoneIcon className="h-4 w-4" />}>
                                        Sua entrega foi registrada e a EXP da fase foi concedida.
                                    </Alert>
                                ) : null}

                                {/* O botão sai do cabeçalho enquanto a entrega está em análise ou já foi aprovada. */}
                                {error && !composing ? <p role="alert" className="border-2 border-red bg-red-overlay p-4 text-xs text-red-light">{error}</p> : null}
                                <SubmissionsTable
                                    mission={mission}
                                    onCancelSubmission={cancelSubmission}
                                    onAdvanceSubmission={mission.allowsMultipleSubmissions ? (submissionId) => openComposer(submissionId) : undefined}
                                    action={
                                        acceptsEvidence(mission) ? (
                                            <Button type="button" onClick={() => openComposer(null, mission.allowsMultipleSubmissions)} className="px-4 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                                                <UploadIcon className="h-4 w-4" /> {mission.allowsMultipleSubmissions ? "Nova submissão" : "Nova evidência"}
                                            </Button>
                                        ) : null
                                    }
                                />
                            </div>

                            <Modal open={composing} title={startsNewSubmission ? "Nova submissão" : "Nova evidência"} description={composerDescription(mission, startsNewSubmission)} onClose={() => setComposing(false)}>
                                <MissionEvidenceForm mission={mission} submitting={submitting} submitError={error} onSubmit={submitEvidence} onCancel={() => setComposing(false)} />
                            </Modal>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
