import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { MuralSubmission } from "@/types/mission";

/** O conteúdo entregue, do jeito que cada tipo pede ser lido: nome, endereço clicável ou relato. */
export function EvidenceValue({ submission, className }: { submission: MuralSubmission; className?: string }) {
    if (submission.kind === "link") {
        return (
            <a href={submission.value} target="_blank" rel="noreferrer" className={cn("block break-all text-sm font-bold text-primary-light underline decoration-primary-dark underline-offset-4 transition hover:text-primary", className)}>
                {submission.value}
            </a>
        );
    }

    if (submission.kind === "text") return <p className={cn("whitespace-pre-line text-sm leading-relaxed text-white-soft", className)}>{renderTextWithNumericFont(submission.value)}</p>;

    return <p className={cn("break-all text-sm font-bold text-primary-light", className)}>{submission.value}</p>;
}
