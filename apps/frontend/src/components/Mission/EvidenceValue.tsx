import { useState } from "react";
import { muralService } from "@/api/mural";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { MuralSubmission } from "@/types/mission";

/** O conteúdo entregue, do jeito que cada tipo pede ser lido: nome, endereço clicável ou relato. */
export function EvidenceValue({ submission, className }: { submission: MuralSubmission; className?: string }) {
    const [error, setError] = useState<string | null>(null);
    if (submission.kind === "file") return (
        <div className={className}>
            <button type="button" onClick={async () => {
                setError(null);
                try {
                    const url = await muralService.download(submission.id, submission.downloadPhase ?? submission.phase ?? 1);
                    window.location.assign(url);
                } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível abrir o arquivo."); }
            }} className="break-all text-left text-sm font-bold text-primary-light underline decoration-primary-dark underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary-light">{submission.value}</button>
            {error ? <p role="alert" className="mt-1 text-xs text-red-light">{error}</p> : null}
        </div>
    );
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
