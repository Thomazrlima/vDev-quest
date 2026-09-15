import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Pagination } from "@/components/ui/Pagination";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { renderTextWithNumericFont } from "@/lib/typography";
import { FeedEmptyState } from "./FeedEmptyState";
import { FeedFilters } from "./FeedFilters";
import { FeedPost } from "./FeedPost";
import { FeedTile } from "./FeedTile";
import { muralService } from "@/mocks/services/mural";
import type { FeedEntry, FeedFilters as Filters } from "@/types/mission";
import { feedMissions, filterFeed } from "@/utils/mural";
import { clampPage, pageCountOf, pageSlice } from "@/utils/pagination";

/** Duas fileiras do mosaico por página, e o mesmo tanto de fantasmas enquanto o feed carrega. */
const PAGE_SIZE = 6;

const NO_FILTERS: Filters = { missionId: "", status: "" };

/** O mosaico do perfil: cada quadrado é uma entrega, da mais recente para a mais antiga. */
export function ProfileFeed() {
    const [feed, setFeed] = useState<FeedEntry[] | null>(null);
    const [filters, setFilters] = useState<Filters>(NO_FILTERS);
    const [page, setPage] = useState(1);
    // Guardar o id, e não a entrega, deixa o post aberto acompanhar uma lista que se atualize.
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        muralService.feed().then((data) => {
            if (active) setFeed(data);
        });

        return () => {
            active = false;
        };
    }, []);

    // Estabilizar a lista vazia evita refazer os recortes a cada render enquanto o feed carrega.
    const entries = useMemo(() => feed ?? [], [feed]);
    // O filtro por missão só oferece o que já foi entregue, então ele sai do feed inteiro.
    const missions = useMemo(() => feedMissions(entries), [entries]);
    const visible = useMemo(() => filterFeed(entries, filters), [entries, filters]);
    const filtering = Boolean(filters.missionId || filters.status);

    // A página vem do estado, mas quem manda é a lista: um recorte menor traz a página de volta.
    const pageCount = pageCountOf(visible.length, PAGE_SIZE);
    const currentPage = clampPage(page, pageCount);
    const tiles = useMemo(() => pageSlice(visible, currentPage, PAGE_SIZE), [visible, currentPage]);

    // "10–18 de 24 entregas" diz onde a leitura está sem obrigar a contar os quadrados.
    const firstOnPage = (currentPage - 1) * PAGE_SIZE + 1;
    const rangeLabel = `${firstOnPage}–${firstOnPage + tiles.length - 1} de ${visible.length} entregas`;

    /** Trocar o recorte recomeça a leitura: a página 4 do filtro anterior não diz nada sobre o novo. */
    function applyFilters(next: Filters) {
        setFilters(next);
        setPage(1);
    }

    function clearFilters() {
        applyFilters(NO_FILTERS);
    }

    // Os números falam do que está à vista: com um recorte aplicado, eles contam o recorte.
    const counters = useMemo(
        () =>
            [
                [visible.length, visible.length === 1 ? "entrega" : "entregas"],
                [visible.filter(({ submission }) => submission.status === "aprovada").length, "aprovadas"],
                [visible.filter(({ submission }) => submission.status === "pendente").length, "em análise"],
            ] as const,
        [visible],
    );

    const open = entries.find(({ submission }) => submission.id === openId) ?? null;

    // Sem `overflow-hidden` no painel: o menu dos filtros é absoluto e a borda o cortaria.
    return (
        <Card as="section" aria-labelledby="profile-feed-title" className={HALL_PANEL}>
            <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-primary-dark bg-black-overlay px-5 py-5 sm:px-8">
                <div>
                    <Eyebrow className="mb-2">Feed de entregas</Eyebrow>
                    <Heading as="h2" id="profile-feed-title" size="sm">
                        Missões enviadas
                    </Heading>
                </div>

                {/* Os números do perfil: quanto já foi entregue, quanto virou conquista e quanto ainda espera veredito. */}
                <dl className="flex items-center gap-6">
                    {counters.map(([value, label]) => (
                        <div key={label} className="text-center">
                            <dt className="sr-only">{label}</dt>
                            <dd>
                                <strong className="block text-2xl font-black text-primary-light">{renderTextWithNumericFont(value)}</strong>
                                <span aria-hidden="true" className="mt-0.5 block text-[.6rem] font-black uppercase tracking-[.12em] text-primary">
                                    {label}
                                </span>
                            </dd>
                        </div>
                    ))}
                </dl>
            </header>

            {/* Sem histórico não há o que recortar: a barra de filtros só aparece com entregas em mãos. */}
            {entries.length ? <FeedFilters missions={missions} filters={filters} onChange={applyFilters} onClear={clearFilters} /> : null}

            {feed === null ? (
                <div className="grid grid-cols-3 gap-1.5 bg-black-overlay p-3 sm:gap-2.5 sm:p-4" role="status" aria-label="Carregando suas entregas">
                    {Array.from({ length: PAGE_SIZE }, (_, index) => (
                        <span key={index} aria-hidden="true" className="aspect-square animate-pulse border-2 border-primary-dark bg-black-muted" />
                    ))}
                </div>
            ) : visible.length ? (
                <>
                    <div className="grid grid-cols-3 gap-1.5 bg-black-overlay p-3 sm:gap-2.5 sm:p-4">
                        {tiles.map((entry) => (
                            <FeedTile key={entry.submission.id} entry={entry} onOpen={() => setOpenId(entry.submission.id)} />
                        ))}
                    </div>

                    {/* Com uma página só não há o que navegar: o rodapé fica de fora. */}
                    {pageCount > 1 ? <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} label={rangeLabel} className="border-t-2 border-primary-dark bg-black px-5 py-4 sm:px-8" /> : null}
                </>
            ) : (
                <FeedEmptyState filtering={filtering} onClear={clearFilters} />
            )}

            {open ? <FeedPost entry={open} onClose={() => setOpenId(null)} /> : null}
        </Card>
    );
}
