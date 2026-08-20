import { useEffect, useState } from "react";
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
import { muralService } from "@/mocks/services/mural";
import type { MuralMission } from "@/types/mission";
import { acceptsEvidence, muralStateOf, openRefusal } from "@/utils/mural";

/** O modal explica o que a missão pede — e, se houve recusa, que este envio é o reenvio dela. */
function composerDescription(mission: MuralMission) {
    if (openRefusal(mission)) return `Ajuste o que o gestor apontou: este envio entra como uma nova submissão do tipo ${mission.evidenceType}.`;
    return `Esta missão exige evidência do tipo ${mission.evidenceType}. Cada envio vira uma submissão no histórico.`;
}

export const Route = createFileRoute("/_app/mural/$id/")({
    component: MuralMissionPage,
});

function MuralMissionPage() {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const [mission, setMission] = useState<MuralMission | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [composing, setComposing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        let active = true;

        muralService.getById(id).then((data) => {
            if (!active) return;
            setMission(data);
            setLoading(false);
        });

        return () => {
            active = false;
        };
    }, [id]);

    // De volta ao mural, a aba certa é a de agora: quem acabou de enviar cai em "Aguardando".
    function backToMural() {
        navigate({ to: "/mural", search: { status: mission ? muralStateOf(mission) : "disponiveis" } });
    }

    // Abrir o modal começa uma entrega nova: o erro e o aviso da anterior não vêm junto.
    function openComposer() {
        setError(null);
        setSent(false);
        setComposing(true);
    }

    async function submitEvidence(evidence: FormData) {
        setSubmitting(true);
        setError(null);
        try {
            setMission(await muralService.submit(id, evidence));
            setComposing(false);
            setSent(true);
        } catch (problem) {
            setError(problem instanceof Error ? problem.message : "Não foi possível enviar a evidência. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            {/* A mesma tábua do mural: abrir uma missão é tirar o papel do prego, não trocar de lugar. */}
            <section className={cn("flex-1 bg-[linear-gradient(rgb(15_14_14/58%),rgb(15_14_14/58%)),url('/images/backgrounds/mural3.png')] bg-cover bg-fixed bg-center px-4 pb-9 sm:px-6 sm:pb-13", CLEAR_RETURN_LINK)}>
                <div className="mx-auto w-[min(896px,100%)]">
                    <Button variant="ghost" onClick={backToMural} className="mb-7 p-0 text-[11px] text-primary hover:text-primary-light">
                        <ChevronIcon className="h-4 w-4 rotate-180" /> Mural da temporada
                    </Button>

                    {loading ? (
                        <Card className={HALL_PANEL}>
                            <Loading message="Desenrolando o pergaminho da missão..." />
                        </Card>
                    ) : !mission ? (
                        <Card className={cn("p-8 text-center", HALL_PANEL)}>
                            <p className="text-sm text-primary-light">Esta missão não está no mural da temporada.</p>
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
                                        Sua entrega foi registrada e agora aguarda a aprovação do gestor.
                                    </Alert>
                                ) : null}

                                {/* O botão sai do cabeçalho enquanto a entrega está em análise ou já foi aprovada. */}
                                <SubmissionsTable
                                    mission={mission}
                                    action={
                                        acceptsEvidence(mission) ? (
                                            <Button type="button" onClick={openComposer} className="px-4 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                                                <UploadIcon className="h-4 w-4" /> Nova evidência
                                            </Button>
                                        ) : null
                                    }
                                />
                            </div>

                            <Modal open={composing} title="Nova evidência" description={composerDescription(mission)} onClose={() => setComposing(false)}>
                                <MissionEvidenceForm mission={mission} submitting={submitting} submitError={error} onSubmit={submitEvidence} onCancel={() => setComposing(false)} />
                            </Modal>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
