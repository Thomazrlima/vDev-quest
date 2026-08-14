import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/tailwind";

type CardProps<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

export function Card<T extends ElementType = "section">({ as, className, ...props }: CardProps<T>) {
    const Component = as ?? "section";
    return <Component className={cn("border-[3px] border-[var(--color-orange-dark)] bg-[linear-gradient(135deg,var(--color-white-overlay),transparent_40%),var(--color-black)] shadow-[0_0_0_3px_var(--color-orange-dark),7px_7px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-orange-overlay)]", className)} {...props} />;
}
