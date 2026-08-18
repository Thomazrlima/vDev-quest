import type { ReactNode } from "react";
import { cn } from "@/lib/tailwind";

export type BadgeTone = "primary" | "muted" | "success" | "danger";

/** Amarelo para o que está em jogo, verde para o aprovado, vermelho para o recusado. */
const tones = {
    primary: "border-primary bg-primary-overlay text-primary-light",
    muted: "border-primary-dark bg-primary-overlay text-primary",
    success: "border-green bg-green-overlay text-green-light",
    danger: "border-red bg-red-overlay text-red-light",
} as const;

/** O selo pixelado das listas e cabeçalhos: moldura de 2px, texto miúdo em caixa alta. */
export function Badge({ tone = "primary", icon, className, children }: { tone?: BadgeTone; icon?: ReactNode; className?: string; children: ReactNode }) {
    return (
        <span className={cn("inline-flex shrink-0 items-center gap-1.5 border-2 px-2 py-1 text-[9px] font-black uppercase tracking-[.12em]", tones[tone], className)}>
            {icon}
            {children}
        </span>
    );
}
