import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { renderTextWithNumericFont } from "@/lib/typography";

export function PageHeader({ eyebrow, title, description, action, centered = false }: { eyebrow: string; title: string; description?: string; action?: ReactNode; centered?: boolean }) {
    return (
        <header className={centered ? "text-center" : "flex flex-col justify-between gap-6 border-b border-primary-dark/70 pb-6 sm:flex-row sm:items-end"}>
            <div className={centered ? "" : "border-l-2 border-primary pl-4 sm:pl-5"}>
                <Eyebrow>{eyebrow}</Eyebrow>
                <Heading className={`mt-2 ${centered ? "mx-auto lg:text-5xl" : ""}`}>{title}</Heading>
                {description ? <p className={`mt-3 text-sm leading-relaxed text-[var(--color-white-muted)] ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{renderTextWithNumericFont(description)}</p> : null}
            </div>
            {action}
        </header>
    );
}
