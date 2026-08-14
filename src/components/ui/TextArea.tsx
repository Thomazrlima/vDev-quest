import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/tailwind";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    description?: string;
    containerClassName?: string;
};

export function TextArea({ id, label, error, description, containerClassName, className, required, ...props }: TextAreaProps) {
    const generatedId = useId();
    const textAreaId = id ?? generatedId;

    return (
        <label htmlFor={textAreaId} className={cn("block", containerClassName)}>
            {label ? (
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-primary-light">
                    {label}
                    {required ? <span className="text-primary"> *</span> : null}
                </span>
            ) : null}
            <textarea
                id={textAreaId}
                required={required}
                className={cn("min-h-28 w-full resize-y border-2 bg-[var(--color-black)] px-4 py-3 text-sm text-white outline-none shadow-[inset_3px_3px_0_var(--color-green-dark)] transition placeholder:text-[var(--color-black-muted)] focus:border-primary disabled:cursor-not-allowed disabled:border-[var(--color-black-soft)] disabled:bg-[var(--color-black)] disabled:text-[var(--color-black-muted)]", error ? "border-[var(--color-orange)]" : "border-[var(--color-orange-dark)]", className)}
                {...props}
            />
            {description ? <span className="mt-2 block text-[11px] text-[var(--color-black-muted)]">{description}</span> : null}
            {error ? (
                <span role="alert" className="mt-2 block text-[11px] font-bold text-[var(--color-orange)]">
                    {error}
                </span>
            ) : null}
        </label>
    );
}
