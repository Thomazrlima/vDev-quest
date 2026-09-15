import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

type HeadingProps<T extends ElementType> = {
    as?: T;
    size?: "sm" | "md" | "lg";
} & ComponentPropsWithoutRef<T>;

export function Heading<T extends ElementType = "h1">({ as, size = "md", className, children, ...props }: HeadingProps<T>) {
    const Component = as ?? "h1";
    const sizes = { sm: "text-2xl sm:text-3xl", md: "text-3xl sm:text-4xl", lg: "text-3xl sm:text-4xl lg:text-5xl" };
    return (
        <Component className={cn("font-black uppercase tracking-[.08em] text-primary-light [text-shadow:3px_3px_0_var(--color-primary-dark)]", sizes[size], className)} {...props}>
            {typeof children === "string" || typeof children === "number" ? renderTextWithNumericFont(children) : children}
        </Component>
    );
}
