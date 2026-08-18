import type { ReactNode } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

type DetailCardProps = {
    label: string;
    value: string;
    icon?: ReactNode;
    /** Uma segunda linha menor, para o que explica o valor — "encerra amanhã", por exemplo. */
    hint?: string;
    /** Tinge o dado de laranja quando ele pede atenção, como um prazo perto do fim. */
    highlight?: boolean;
    className?: string;
};

/** Um dado da ficha: rótulo pequeno em cima, valor em destaque embaixo. */
export function DetailCard({ label, value, icon, hint, highlight = false, className }: DetailCardProps) {
    return (
        <article className={cn("border-2 border-primary-dark bg-black p-4", className)}>
            <h3 className="flex items-center gap-1.5 text-[.65rem] font-black uppercase tracking-[.08em] text-primary">
                {icon}
                {renderTextWithNumericFont(label)}
            </h3>
            <p className={cn("mt-2 text-sm font-bold", highlight ? "text-(--color-orange-light)" : "text-primary-light")}>{renderTextWithNumericFont(value)}</p>
            {hint ? <p className={cn("mt-1 text-[.65rem] leading-relaxed", highlight ? "text-(--color-orange)" : "text-white-muted")}>{renderTextWithNumericFont(hint)}</p> : null}
        </article>
    );
}
