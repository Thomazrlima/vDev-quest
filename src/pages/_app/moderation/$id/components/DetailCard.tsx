export function DetailCard({ label, value }: { label: string; value: string }) {
    return (
        <article className="border-2 border-[var(--color-orange-dark)] bg-[var(--color-black)] p-4">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-primary-light">{label}</h3>
            <p className="mt-2 text-sm font-bold text-[var(--color-primary-light)]">{value}</p>
        </article>
    );
}
