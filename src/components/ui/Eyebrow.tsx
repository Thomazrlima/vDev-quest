import type { HTMLAttributes } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

export function Eyebrow({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn("text-[.7rem] font-extrabold uppercase tracking-[.2em] text-primary", className)} {...props}>
            {typeof children === "string" || typeof children === "number" ? renderTextWithNumericFont(children) : children}
        </p>
    );
}
