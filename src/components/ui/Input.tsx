import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    description?: string;
    containerClassName?: string;
    endAdornment?: ReactNode;
    children?: ReactNode;
};

export function Input({ id, label, error, description, containerClassName, className, endAdornment, required, children, ...props }: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <label htmlFor={inputId} className={cn("block", containerClassName)}>
            {label ? (
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-primary-light">
                    {renderTextWithNumericFont(label)}
                    {required ? <span className="text-primary"> *</span> : null}
                </span>
            ) : null}
            <span className="relative block">
                <input
                    id={inputId}
                    required={required}
                    className={cn("w-full border-2 bg-[var(--color-black)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-white-muted)] focus:border-primary disabled:cursor-not-allowed disabled:border-[var(--color-black-soft)] disabled:bg-[var(--color-black)] disabled:text-[var(--color-black-muted)]", error ? "border-[var(--color-orange)]" : "border-[var(--color-primary-dark)]", endAdornment && "pr-16", props.type === "number" && "font-numeric", className)}
                    {...props}
                />
                {endAdornment ? <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">{typeof endAdornment === "string" || typeof endAdornment === "number" ? renderTextWithNumericFont(endAdornment) : endAdornment}</span> : null}
            </span>
            {description ? <span className="mt-2 block text-[11px] text-[var(--color-white-muted)]">{renderTextWithNumericFont(description)}</span> : null}
            {error ? (
                <span role="alert" className="mt-2 block text-[11px] font-bold text-[var(--color-orange)]">
                    {renderTextWithNumericFont(error)}
                </span>
            ) : null}
            {children}
        </label>
    );
}
