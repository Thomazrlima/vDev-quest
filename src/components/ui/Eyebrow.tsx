import type { HTMLAttributes } from "react";
import { cn } from "@/lib/tailwind";

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-[.7rem] font-extrabold uppercase tracking-[.2em] text-[var(--color-orange)]", className)} {...props} />;
}
