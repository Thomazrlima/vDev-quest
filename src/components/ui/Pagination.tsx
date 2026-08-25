import { ChevronIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import { clampPage, pageItems } from "@/utils/pagination";

type PaginationProps = {
    /** A página atual, contada a partir de 1. */
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    /** O resumo à esquerda, como "9 de 24 entregas"; sem ele fica a contagem de páginas. */
    label?: string;
    /** Quantas páginas acompanham a atual de cada lado antes das reticências. */
    siblings?: number;
    className?: string;
};

/** O mesmo quadrado pixelado dos outros controles, aqui em tamanho de botão de página. */
const PAGE_BUTTON = "h-9 min-w-9 border-2 px-2 py-0 text-[.7rem] tracking-[.1em]";

/** A paginação da casa: setas nas pontas, números no meio e reticências no que foi pulado. */
export function Pagination({ page, pageCount, onPageChange, label, siblings = 1, className }: PaginationProps) {
    const current = clampPage(page, pageCount);
    const items = pageItems(current, pageCount, siblings);

    function goTo(next: number) {
        const target = clampPage(next, pageCount);
        if (target !== current) onPageChange(target);
    }

    return (
        <nav aria-label="Paginação" className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
            <p className="text-[.6rem] font-black uppercase tracking-[.12em] text-primary">{renderTextWithNumericFont(label ?? `Página ${current} de ${pageCount}`)}</p>

            <ul className="flex items-center gap-1.5">
                <li>
                    <Button type="button" variant="ghost" onClick={() => goTo(current - 1)} disabled={current === 1} aria-label="Página anterior" className={cn(PAGE_BUTTON, "border-primary-dark text-primary hover:text-primary-light")}>
                        <ChevronIcon className="h-4 w-4 rotate-180" />
                    </Button>
                </li>

                {items.map((item, index) =>
                    item === "gap" ? (
                        <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-[.7rem] font-black text-primary-dark">
                            …
                        </li>
                    ) : (
                        <li key={item}>
                            <Button type="button" variant="ghost" onClick={() => goTo(item)} aria-label={`Página ${item}`} aria-current={item === current ? "page" : undefined} className={cn(PAGE_BUTTON, item === current ? "border-primary bg-primary-overlay text-primary-light" : "border-primary-dark text-white-muted hover:text-primary-light")}>
                                {item}
                            </Button>
                        </li>
                    ),
                )}

                <li>
                    <Button type="button" variant="ghost" onClick={() => goTo(current + 1)} disabled={current === pageCount} aria-label="Próxima página" className={cn(PAGE_BUTTON, "border-primary-dark text-primary hover:text-primary-light")}>
                        <ChevronIcon className="h-4 w-4" />
                    </Button>
                </li>
            </ul>
        </nav>
    );
}
