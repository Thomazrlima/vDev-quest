import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/tailwind";

/**
 * As duas folhas pregadas no mural. A arte não encosta nas bordas do PNG: sobra transparente em
 * volta do papel e, na folha lacrada, uma faixa vazia de 14% no rodapé. Se essa sobra entrasse na
 * caixa do card ela viraria buraco no grid, então a imagem transborda pelas medidas tiradas do
 * canal alfa e só o papel desenhado ocupa a caixa.
 */
const sheets = {
    plain: {
        src: "/images/assets/paper-2.png",
        bleed: "left-[-2.61%] top-[-1.76%] h-[101.76%] w-[102.61%]",
        // A dobra de baixo escurece o papel a partir dos 90% da altura: o texto para antes dela.
        content: "px-[10.5%] pt-[9%] pb-[17%]",
    },
    sealed: {
        src: "/images/assets/paper-1.png",
        bleed: "left-[-2.04%] top-[-1.7%] h-[118.18%] w-[104.89%]",
        // O lacre de cera ocupa dos 76% aos 86% da altura: o texto termina antes de esbarrar nele.
        content: "px-[10.5%] pt-[9%] pb-[35%]",
    },
} as const;

export type PaperVariant = keyof typeof sheets;

/**
 * Papéis pregados à mão nunca ficam retos. A inclinação vem da posição na lista — e não de um
 * sorteio — para a mesma folha não dançar a cada render, e para o esqueleto de carregamento nascer
 * na mesma pose do card que vai substituí-lo.
 */
export const PAPER_TILTS = ["-rotate-[1.4deg]", "rotate-[.9deg]", "-rotate-[.6deg]", "rotate-[1.5deg]", "-rotate-[1deg]", "rotate-[.5deg]"] as const;

type PaperSheetProps<T extends ElementType> = {
    as?: T;
    variant?: PaperVariant;
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
    imageClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "children" | "className">;

/**
 * A folha mantém a proporção do papel — texto demais recorta, e nunca estica a arte. Como a
 * largura de um card varia bastante entre o celular e o grid de três colunas, o conteúdo mede
 * tipografia em `cqw`: quem escreve aqui dentro escala junto com a folha.
 */
export function PaperSheet<T extends ElementType = "div">({ as, variant = "plain", className, contentClassName, imageClassName, children, ...props }: PaperSheetProps<T>) {
    const Component = as ?? "div";
    const sheet = sheets[variant];

    return (
        <Component className={cn("@container relative isolate aspect-3/4", className)} {...props}>
            {/* A sombra vai no filtro, e não no box: as bordas rasgadas do papel não são um retângulo. */}
            <img src={sheet.src} alt="" aria-hidden="true" decoding="async" className={cn("pointer-events-none absolute -z-1 max-w-none select-none drop-shadow-[5px_6px_0_rgb(15_14_14/45%)]", sheet.bleed, imageClassName)} />
            {/* O prego que segura a folha na tábua: toda folha do mural está pregada. */}
            <span aria-hidden="true" className="absolute left-1/2 top-[3.2%] size-[clamp(.7rem,3.8cqw,1.15rem)] -translate-x-1/2 rounded-full border-2 border-ink-dark bg-primary shadow-[inset_-2px_-2px_0_var(--color-primary-dark),0_2px_0_rgb(46_32_17/35%)]" />
            <div className={cn("relative flex h-full flex-col overflow-hidden", sheet.content, contentClassName)}>{children}</div>
        </Component>
    );
}
