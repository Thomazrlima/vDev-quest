import { Card } from "@/components/ui/Card";
import { HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";

/** Um card fantasma com a mesma altura do real, para o grid não saltar ao carregar. */
export function MuralMissionSkeleton() {
    return (
        <Card as="div" aria-hidden="true" className={cn("flex h-full animate-pulse flex-col gap-4 p-5", HALL_PANEL)}>
            <div className="flex items-start justify-between gap-3">
                <span className="h-4 w-40 bg-primary-dark/50" />
                <span className="h-5 w-20 shrink-0 bg-primary-dark/40" />
            </div>
            <div className="grid gap-2">
                <span className="block h-2.5 w-full bg-black-muted" />
                <span className="block h-2.5 w-11/12 bg-black-muted" />
                <span className="block h-2.5 w-2/3 bg-black-muted" />
            </div>
            <div className="mt-auto grid gap-3 border-t-2 border-primary-dark pt-4">
                <span className="block h-2.5 w-full bg-black-muted" />
                <span className="block h-2.5 w-5/6 bg-black-muted" />
                <span className="block h-2.5 w-3/4 bg-black-muted" />
            </div>
        </Card>
    );
}
