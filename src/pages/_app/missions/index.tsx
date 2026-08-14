import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
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
            <Button variant="secondary" onClick={() => navigate({ to: "/moderation" })} className="px-5 py-4 text-[11px]">
                Fila de moderação
            </Button>
            <Button onClick={() => navigate({ to: "/missions/new" })} className="px-5 py-4 text-[11px]">
                <SparkIcon className="h-4 w-4" /> Nova missão
            </Button>
        </div>
    );

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <PageHeader eyebrow="Gestão de missões · OS-1" title="Quadro de missões" description="Crie desafios para a guilda, acompanhe a jornada e revise suas evidências." action={actions} />
            {published ? (
                <div role="status" className="mt-7 border-2 border-[var(--color-green)] bg-[var(--color-green-dark)] px-4 py-3 text-xs font-bold text-[var(--color-green)]">
                    Missão publicada com sucesso. Ela já está disponível para a guilda.
                </div>
            ) : null}
            <MissionList missions={missions} loading={loading} onOpen={(mission) => navigate({ to: "/missions/$id/edit", params: { id: mission.id } })} />
            <p className="mt-4 text-[10px] text-[var(--color-black-muted)]">Demonstração: abra “Sprint dos guardiões” para visualizar o bloqueio de edição por progresso.</p>
        </main>
    );
}
