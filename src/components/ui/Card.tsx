import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

type CardProps<T extends ElementType> = {
    as?: T;
    children?: ReactNode;
    icon?: ReactNode;
    label?: string;
    value?: string;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

export function Card<T extends ElementType = "section">({ as, children, className, icon, label, value, ...props }: CardProps<T>) {
    const Component = as ?? "section";
    return (
        <Component className={cn("border-0.75 border-primary bg-card shadow-card", className)} {...props}>
            {children ?? (
                <>
                    <strong className="block text-2xl font-black text-primary-light">{renderTextWithNumericFont(value)}</strong>
                    <span className="mt-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-black-muted">
                        {icon}
                        {label}
                    </span>
                </>
            )}
        </Component>
    );
}
