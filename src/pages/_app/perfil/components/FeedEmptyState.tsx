import { Link } from "@tanstack/react-router";
import { ChevronIcon, ScrollIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

/**
 * Feed vazio e filtro sem resultado pedem saídas diferentes: um manda para o mural, o outro
 * desfaz o recorte que escondeu o histórico.
 */
export function FeedEmptyState({ filtering, onClear }: { filtering: boolean; onClear: () => void }) {
    return (
        <div className="bg-black-overlay px-6 py-12 text-center">
            <span aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center border-2 border-primary-dark bg-black text-primary">
                <ScrollIcon className="h-8 w-8" />
            </span>
            <strong className="mt-5 block text-base font-black uppercase tracking-[.08em] text-primary-light">{filtering ? "Nenhuma entrega com esse recorte" : "Seu feed ainda está vazio"}</strong>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white-muted">{filtering ? "Troque a missão ou o status para ver outras entregas do seu histórico." : "Envie a evidência de uma missão do mural e ela aparece aqui, com o veredito do gestor."}</p>

            {filtering ? (
                <Button type="button" variant="secondary" onClick={onClear} className="mt-6 border-primary-dark px-5 text-[10px] text-primary-light">
                    Limpar filtros
                </Button>
            ) : (
                <Button asChild className="mt-6 px-5 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                    <Link to="/mural">
                        Ir para o mural <ChevronIcon className="h-4 w-4" />
                    </Link>
                </Button>
            )}
        </div>
    );
}
