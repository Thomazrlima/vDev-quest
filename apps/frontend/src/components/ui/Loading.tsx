import type { HTMLAttributes } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

export function Loading({ message, className, ...props }: HTMLAttributes<HTMLDivElement> & { message?: string }) {
    return (
        <div role="status" className={cn("flex items-center justify-center gap-3 p-8 text-sm text-[var(--color-white-muted)]", className)} {...props}>
            <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-orange-dark)] border-t-primary" />
            {message ? <span>{renderTextWithNumericFont(message)}</span> : null}
        </div>
    );
}
