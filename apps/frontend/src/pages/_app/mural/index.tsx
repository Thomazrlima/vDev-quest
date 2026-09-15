import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/PageHeader";
import { BLEED_UNDER_RETURN_LINK, CLEAR_RETURN_LINK } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { MuralEmptyState } from "./components/MuralEmptyState";
import { MuralFilters } from "./components/MuralFilters";
import { MuralMissionCard } from "./components/MuralMissionCard";
import { MuralMissionSkeleton } from "./components/MuralMissionSkeleton";
import { muralService } from "@/mocks/services/mural";
import { MURAL_FILTERS, type MuralFilter, type MuralMission } from "@/types/mission";

const SKELETON_COUNT = 4;

export type MuralSearch = {
    status?: MuralFilter;
};

function parseFilter(value: unknown): MuralFilter {
    return MURAL_FILTERS.some((filter) => filter.value === value) ? (value as MuralFilter) : "disponiveis";
}

export const Route = createFileRoute("/_app/mural/")({
    // Sem parâmetro na URL o mural abre em "Disponíveis", como pede a FE-05.
    validateSearch: (search): MuralSearch => ({ status: parseFilter(search.status) }),
    component: MuralPage,
});

function MuralPage() {
    const navigate = useNavigate();
    const { status } = useSearch({ from: "/_app/mural/" });
    const filter = parseFilter(status);
    // Guardar de qual aba veio a resposta deixa "carregando" ser derivado: enquanto o que está
    // em mãos não for da aba atual, o grid mostra o skeleton — e uma resposta atrasada da aba
    // anterior nunca preenche a aba nova.
    const [loaded, setLoaded] = useState<{ filter: MuralFilter; missions: MuralMission[] } | null>(null);
    const loading = loaded?.filter !== filter;
    const missions = loaded?.missions ?? [];

    useEffect(() => {
        let active = true;

        muralService.list(filter).then((data) => {
            if (active) setLoaded({ filter, missions: data });
        });

        return () => {
            active = false;
        };
    }, [filter]);

    return (
        <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
            {/* O mural tem tábua própria em vez da parede de pedra do Hall da Fama. */}
            <section className={cn("flex-1 bg-[linear-gradient(rgb(15_14_14/58%),rgb(15_14_14/58%)),url('/images/backgrounds/mural3.png')] bg-cover bg-fixed bg-center px-4 pb-9 sm:px-6 sm:pb-13", CLEAR_RETURN_LINK)}>
                <div className="mx-auto w-[min(1180px,100%)]">
                    <PageHeader eyebrow="Mural de missões · FE-05" title="Mural da temporada" description="Escolha seus desafios, acompanhe o que está em moderação e revise o que já conquistou." />
                    <div className="mt-7">
                        <MuralFilters value={filter} onChange={(next) => navigate({ to: "/mural", search: { status: next } })} />
                    </div>

                    {loading ? (
                        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Carregando missões do mural">
                            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                                <MuralMissionSkeleton key={index} />
                            ))}
                        </div>
                    ) : missions.length ? (
                        <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {missions.map((mission, index) => (
                                <MuralMissionCard key={mission.id} mission={mission} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-7">
                            <MuralEmptyState filter={filter} />
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
