import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

export type AlertTone = "error" | "warning" | "success" | "info";

/** Erro e aviso interrompem a leitura de quem usa leitor de tela; sucesso e informação só anunciam. */
const tones = {
    error: { role: "alert", panel: "border-red bg-red-overlay text-red-light", badge: "border-red bg-red-dark text-red-light" },
    warning: { role: "alert", panel: "border-(--color-orange) bg-orange-overlay text-(--color-orange-light)", badge: "border-(--color-orange) bg-orange-dark text-(--color-orange-light)" },
    success: { role: "status", panel: "border-green bg-green-overlay text-green-light", badge: "border-green bg-green-dark text-green-light" },
    info: { role: "status", panel: "border-primary bg-primary-overlay text-primary-light", badge: "border-primary bg-black text-primary" },
} as const;

type AlertProps = HTMLAttributes<HTMLDivElement> & { tone?: AlertTone; title?: string; icon?: ReactNode };

/** O aviso em faixa das telas: mesma moldura pixelada, cor conforme a gravidade. */
export function Alert({ tone = "info", title, icon, className, children, ...props }: AlertProps) {
    const { role, panel, badge } = tones[tone];

    return (
        <div role={role} className={cn("flex gap-3 border-2 p-4 shadow-[4px_4px_0_var(--color-black)]", panel, className)} {...props}>
            {icon ? (
                <span aria-hidden="true" className={cn("grid h-8 w-8 shrink-0 place-items-center border-2", badge)}>
                    {icon}
                </span>
            ) : null}
            <div className="min-w-0 flex-1">
                {title ? <p className="text-xs font-black uppercase tracking-[.12em]">{renderTextWithNumericFont(title)}</p> : null}
                <div className={cn("text-xs leading-relaxed", title && "mt-1.5")}>{children}</div>
            </div>
        </div>
    );
}
