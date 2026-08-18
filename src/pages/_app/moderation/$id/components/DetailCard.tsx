import { renderTextWithNumericFont } from "@/lib/typography";

export function DetailCard({ label, value }: { label: string; value: string }) {
    return (
        <article className="border-2 border-primary-dark bg-black p-4">
            <h3 className="text-[.65rem] font-black uppercase tracking-[.08em] text-primary">{renderTextWithNumericFont(label)}</h3>
            <p className="mt-2 text-sm font-bold text-[var(--color-primary-light)]">{renderTextWithNumericFont(value)}</p>
        </article>
    );
}
