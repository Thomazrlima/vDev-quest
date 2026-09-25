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
        <Component className={cn("border border-primary-dark/80 bg-[rgb(17_16_16/94%)] shadow-[0_14px_30px_rgb(0_0_0/18%)]", className)} {...props}>
            {children ?? (
                <>
                    <strong className="block text-2xl font-black text-primary-light">{renderTextWithNumericFont(value)}</strong>
                    <span className="mt-1 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[.08em] text-primary">
                        {icon}
                        {label}
                    </span>
                </>
            )}
        </Component>
    );
}
