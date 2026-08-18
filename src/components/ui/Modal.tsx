import { useEffect, useId, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

type ModalProps = {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    className?: string;
};

/**
 * O <dialog> nativo entrega de graça o que um overlay improvisado erra: foco preso dentro da
 * caixa, Esc para sair e o resto da página inerte. Aqui ele só ganha a moldura da casa.
 */
export function Modal({ open, title, description, onClose, children, className }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        // O html do projeto tem overflow-y fixo; sem travá-lo, a página rola atrás do modal.
        const root = document.documentElement;
        const previous = root.style.overflow;
        root.style.overflow = "hidden";

        return () => {
            root.style.overflow = previous;
        };
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            // O Esc fecha o dialog por conta própria; ouvir o close é o que mantém o estado em dia.
            onClose={onClose}
            // O clique no ::backdrop chega tendo o próprio dialog como alvo; no painel, não.
            onClick={(event) => {
                if (event.target === dialogRef.current) onClose();
            }}
            className={cn("m-auto max-h-[85vh] w-[min(560px,calc(100vw-2rem))] overflow-y-auto border-4 border-primary bg-black text-white shadow-[6px_6px_0_var(--color-black)] backdrop:bg-[rgb(15_14_14/78%)]", className)}
        >
            {/* Montar o conteúdo só com o modal aberto zera o formulário a cada nova abertura. */}
            {open ? (
                <>
                    <header className="flex items-start justify-between gap-3 border-b-2 border-primary-dark bg-black px-5 py-4 sm:px-6">
                        <div className="min-w-0">
                            <h2 id={titleId} className="text-base font-black uppercase tracking-[.08em] text-primary-light">
                                {renderTextWithNumericFont(title)}
                            </h2>
                            {description ? <p className="mt-1 text-xs leading-relaxed text-white-muted">{renderTextWithNumericFont(description)}</p> : null}
                        </div>
                        <button type="button" onClick={onClose} aria-label="Fechar" className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center border-2 border-primary-dark text-primary transition hover:border-primary hover:text-primary-light">
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </header>
                    {children}
                </>
            ) : null}
        </dialog>
    );
}
