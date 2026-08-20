import { Card } from "@/components/ui/Card";
import { AlertIcon, DoneIcon, PendingIcon, ScrollIcon } from "@/components/icons";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import type { MuralFilter } from "@/types/mission";

/** Cada aba vazia fala do próprio estado — um texto genérico não diria o que fazer a seguir. */
const emptyByFilter = {
    disponiveis: { Icon: ScrollIcon, title: "Nenhuma missão disponível para esta temporada ainda!", hint: "Assim que a guilda publicar novos desafios, eles aparecem aqui." },
    aguardando: { Icon: PendingIcon, title: "Nenhuma entrega aguardando aprovação", hint: "Envie a evidência de uma missão disponível para acompanhar a moderação por aqui." },
    recusadas: { Icon: AlertIcon, title: "Nenhuma missão recusada", hint: "Quando uma entrega precisar de ajuste, ela aparecerá aqui para você reenviar." },
    concluidas: { Icon: DoneIcon, title: "Você ainda não concluiu missões nesta temporada", hint: "Complete um desafio disponível para conquistar sua primeira EXP da temporada." },
} as const;

export function MuralEmptyState({ filter }: { filter: MuralFilter }) {
    const { Icon, title, hint } = emptyByFilter[filter];

    return (
        <Card as="section" className={cn("px-6 py-14 text-center", HALL_PANEL)}>
            <span aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center border-2 border-primary-dark bg-black text-primary">
                <Icon className="h-8 w-8" />
            </span>
            <strong className="mt-5 block text-base font-black uppercase tracking-[.08em] text-primary-light">{title}</strong>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white-muted">{hint}</p>
        </Card>
    );
}
