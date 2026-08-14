import type { ComponentType, SVGProps } from "react";
import { Button } from "@/components/ui/Button";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export function LayerSelector({ label, value, count, icon: Icon, enabled = false, onPrevious, onNext }: { label: string; value: string; count: string; icon: Icon; enabled?: boolean; onPrevious?: () => void; onNext?: () => void }) {
    return (
        <div className={`flex min-h-[54px] items-center gap-[.45rem] border-2 bg-[var(--color-black)] p-[.4rem] shadow-[inset_2px_2px_0_var(--color-primary-overlay),2px_2px_0_var(--color-black)] ${enabled ? "border-[var(--color-orange)] bg-[var(--color-orange-dark)]" : "border-[var(--color-orange-dark)]"}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-[var(--color-orange-dark)] bg-[var(--color-orange-dark)] text-[var(--color-orange)]">
                <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[9px] font-black uppercase tracking-[.14em] text-[var(--color-orange)]">{label}</span>
                <strong className="mt-1 block truncate text-xs text-[var(--color-orange-light)]">{value}</strong>
            </span>
            <Button type="button" aria-label={`Opção anterior de ${label}`} onClick={onPrevious} inactive={!enabled} variant="ghost" className="h-[1.7rem] w-[1.35rem] shrink-0 border-2 border-[var(--color-orange-dark)] bg-[var(--color-orange-dark)] p-0 text-[1.35rem] leading-none text-[var(--color-orange)] hover:border-primary hover:bg-[var(--color-orange-dark)] disabled:opacity-30">
                ‹
            </Button>
            <span className="w-9 text-center text-[9px] font-black text-[var(--color-orange)]">{count}</span>
            <Button type="button" aria-label={`Próxima opção de ${label}`} onClick={onNext} inactive={!enabled} variant="ghost" className="h-[1.7rem] w-[1.35rem] shrink-0 border-2 border-[var(--color-orange-dark)] bg-[var(--color-orange-dark)] p-0 text-[1.35rem] leading-none text-[var(--color-orange)] hover:border-primary hover:bg-[var(--color-orange-dark)] disabled:opacity-30">
                ›
            </Button>
        </div>
    );
}
