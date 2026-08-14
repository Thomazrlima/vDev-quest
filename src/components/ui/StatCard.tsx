import type { ReactNode } from "react";

export function StatCard({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
    return (
        <article className="border-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] p-5 text-center shadow-[4px_4px_0_var(--color-black)]">
            <strong className="block text-2xl font-black text-primary-light">{value}</strong>
            <span className="mt-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-black-muted)]">
                {icon}
                {label}
            </span>
        </article>
    );
}
