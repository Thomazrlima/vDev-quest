import { DoneIcon, PendingIcon, ScrollIcon } from "@/components/icons";
import { PaperSheet } from "@/components/ui/PaperSheet";
import type { MuralFilter } from "@/types/mission";

/** Cada aba vazia fala do próprio estado — um texto genérico não diria o que fazer a seguir. */
const emptyByFilter = {
    disponiveis: { Icon: ScrollIcon, title: "Nenhuma missão disponível para esta temporada ainda!", hint: "Assim que a guilda publicar novos desafios, eles aparecem aqui." },
    aguardando: { Icon: PendingIcon, title: "Nenhuma entrega aguardando aprovação", hint: "Envie a evidência de uma missão disponível para acompanhar a moderação por aqui." },
    concluidas: { Icon: DoneIcon, title: "Você ainda não concluiu missões nesta temporada", hint: "Complete um desafio disponível para conquistar sua primeira EXP da temporada." },
} as const;

/** Um mural vazio é uma folha sozinha no prego, não um painel do tamanho da tábua. */
export function MuralEmptyState({ filter }: { filter: MuralFilter }) {
    const { Icon, title, hint } = emptyByFilter[filter];

    return (
        <PaperSheet as="section" className="mx-auto w-[min(21rem,100%)] -rotate-[.8deg]" contentClassName="items-center justify-center text-center">
            <span aria-hidden="true" className="grid size-[clamp(2.75rem,17cqw,4rem)] place-items-center border-2 border-ink text-ink">
                <Icon className="size-[60%]" />
            </span>
            <strong className="mt-[1em] block text-[clamp(.9rem,4.4cqw,1.3rem)] font-black uppercase leading-tight tracking-[.06em] text-ink-dark">{title}</strong>
            <p className="mt-[.9em] text-[clamp(.75rem,3.4cqw,1rem)] leading-relaxed text-ink">{hint}</p>
        </PaperSheet>
    );
}
