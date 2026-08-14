import type { ComponentType, SVGProps } from "react";
import { ChevronLeft, ChevronRight } from "pixelarticons/react";
import { Button } from "@/components/ui/Button";
import { renderTextWithNumericFont } from "@/lib/typography";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export function LayerSelector({ label, value, count, icon: Icon, enabled = false, onPrevious, onNext }: { label: string; value: string; count: string; icon: Icon; enabled?: boolean; onPrevious?: () => void; onNext?: () => void }) {
    return (
        <div className={`flex min-h-[60px] min-w-0 max-w-full items-center gap-[.45rem] overflow-hidden border-2 bg-[var(--color-black)] p-[.45rem] shadow-[inset_2px_2px_0_var(--color-primary-overlay),2px_2px_0_var(--color-black)] ${enabled ? "border-[var(--color-primary-dark)]" : "border-[var(--color-primary-dark)] opacity-60"}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[var(--color-primary-dark)] bg-[var(--color-black)] text-[var(--color-primary-light)]">
                <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-black uppercase tracking-[.1em] text-[var(--color-primary)]">{renderTextWithNumericFont(label)}</span>
                <strong title={value} className="mt-1 block truncate text-sm text-[var(--color-primary-light)]">
                    {renderTextWithNumericFont(value)}
                </strong>
            </span>
            <Button type="button" aria-label={`Opção anterior de ${label}`} onClick={onPrevious} inactive={!enabled} variant="ghost" className="h-[2rem] w-[1.5rem] shrink-0 border-2 border-[var(--color-primary-dark)] bg-[var(--color-primary-dark)] p-0 text-[1.6rem] leading-none text-[var(--color-primary)] hover:border-primary hover:bg-[var(--color-primary-dark)] disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="w-9 text-center text-[11px] font-black text-[var(--color-primary)]">{renderTextWithNumericFont(count)}</span>
            <Button type="button" aria-label={`Próxima opção de ${label}`} onClick={onNext} inactive={!enabled} variant="ghost" className="h-[2rem] w-[1.5rem] shrink-0 border-2 border-[var(--color-primary-dark)] bg-[var(--color-primary-dark)] p-0 text-[1.6rem] leading-none text-[var(--color-primary)] hover:border-primary hover:bg-[var(--color-primary-dark)] disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
}
