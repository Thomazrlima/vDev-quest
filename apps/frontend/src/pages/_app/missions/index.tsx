import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { BLEED_UNDER_RETURN_LINK, StoneWall } from "@/components/ui/StoneWall";
import { SparkIcon } from "@/components/icons";
import { MissionList } from "./components/MissionList";
import { missionService } from "@/api/missions";

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
    const { data: missions = [], isPending: loading, error } = useQuery({ queryKey: ["missions"], queryFn: missionService.list });
    const published = publishedSearch === "1";

    const actions = (
        <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate({ to: "/moderation" })} className="border-primary-dark px-5 py-4 text-[11px] text-primary-light shadow-[4px_4px_0_var(--color-black)]">
                Consultar entregas
            </Button>
            <Button variant="secondary" onClick={() => navigate({ to: "/admin/imports" })} className="border-primary-dark px-5 py-4 text-[11px] text-primary-light shadow-[4px_4px_0_var(--color-black)]">
                Importar .xlsx
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
                    <PageHeader eyebrow="Gestão de missões" title="Quadro de missões" description="Crie desafios para a guilda, acompanhe a jornada e consulte suas evidências." action={actions} />
                    {published ? (
                        <div role="status" className="mt-7 border-2 border-green bg-green-overlay px-4 py-3 text-xs font-bold text-green-light">
                            Missão criada com sucesso. Ela já está disponível para a guilda.
                        </div>
                    ) : null}
                    {error ? <p role="alert" className="mt-7 border-2 border-red bg-red-overlay p-5 text-sm text-red-light">{error.message}</p> : <MissionList missions={missions} loading={loading} />}
                </div>
            </StoneWall>
        </main>
    );
}
