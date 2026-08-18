import { PaperSheet, PAPER_TILTS } from "@/components/ui/PaperSheet";
import { cn } from "@/lib/tailwind";

/**
 * Uma folha em branco com a proporção, o esqueleto e a inclinação da real: quando a missão chega,
 * ela troca de conteúdo sem mudar de lugar nem se endireitar.
 */
export function MuralMissionSkeleton({ index = 0 }: { index?: number }) {
    return (
        <PaperSheet aria-hidden="true" className={cn(PAPER_TILTS[index % PAPER_TILTS.length])} contentClassName="animate-pulse">
            <div className="flex items-start justify-between gap-[.6em]">
                <span className="block h-[1.4em] w-3/5 bg-ink/25" />
                <span className="block h-[1.2em] w-[28%] shrink-0 bg-ink/20" />
            </div>
            <div className="mt-[1.2em] grid gap-[.6em]">
                <span className="block h-[.7em] w-full bg-ink/15" />
                <span className="block h-[.7em] w-11/12 bg-ink/15" />
                <span className="block h-[.7em] w-2/3 bg-ink/15" />
            </div>
            <div className="my-auto grid justify-items-center gap-[.5em] py-[.7em]">
                <span className="block h-[.7em] w-1/3 bg-ink/15" />
                <span className="block h-[1.8em] w-1/2 bg-ink/25" />
            </div>
            <div className="grid gap-[.7em] border-t-2 border-ink-light/60 pt-[1em]">
                <span className="block h-[.7em] w-5/6 bg-ink/15" />
                <span className="block h-[.7em] w-3/4 bg-ink/15" />
            </div>
        </PaperSheet>
    );
}
