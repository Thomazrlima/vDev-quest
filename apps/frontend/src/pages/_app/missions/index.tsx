import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { BLEED_UNDER_RETURN_LINK, StoneWall } from "@/components/ui/StoneWall";
import { SparkIcon } from "@/components/icons";
import { MissionList } from "./components/MissionList";
import { missionService } from "@/mocks/services/missions";
import type { Mission } from "@/types/mission";

export type MissionSearch = {
    published?: "1";
};

export const Route = createFileRoute("/_app/missions/")({
    validateSearch: (search): MissionSearch => ({
        published: search.published === "1" ? "1" : undefined,
    }),
    component: MissionsPage,
});

function MissionsPage() {
    const navigate = useNavigate();
    const { published: publishedSearch } = useSearch({ from: "/_app/missions/" });
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const published = publishedSearch === "1";

    useEffect(() => {
        missionService.list().then((data) => {
            setMissions(data);
            setLoading(false);
        });
    }, []);

    const actions = (
        <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate({ to: "/moderation" })} className="border-primary-dark px-5 py-4 text-[11px] text-primary-light shadow-[4px_4px_0_var(--color-black)]">
                Fila de moderação
            </Button>
            <Button onClick={() => navigate({ to: "/missions/new" })} className="px-5 py-4 text-[11px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                <SparkIcon className="h-4 w-4" /> Nova missão
            </Button>
        </div>
    );

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            <StoneWall>
                <div className="mx-auto w-[min(1180px,100%)]">
                    <PageHeader eyebrow="Gestão de missões · OS-1" title="Quadro de missões" description="Crie desafios para a guilda, acompanhe a jornada e revise suas evidências." action={actions} />
                    {published ? (
                        <div role="status" className="mt-7 border-2 border-green bg-green-overlay px-4 py-3 text-xs font-bold text-green-light">
                            Missão publicada com sucesso. Ela já está disponível para a guilda.
                        </div>
                    ) : null}
                    <MissionList missions={missions} loading={loading} onOpen={(mission) => navigate({ to: "/missions/$id/edit", params: { id: mission.id } })} />
                    <p className="mt-7 text-center text-[.58rem] font-black uppercase tracking-[.16em] text-primary-light">Demonstração: abra “Sprint dos guardiões” para visualizar o bloqueio de edição por progresso.</p>
                </div>
            </StoneWall>
        </main>
    );
}
