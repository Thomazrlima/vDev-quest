import { cloneElement, type ButtonHTMLAttributes, type ReactElement } from "react";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    inactive?: boolean;
    asChild?: false;
};

type ButtonChildProps = {
    className?: string;
    "aria-disabled"?: boolean;
    "data-inactive"?: string;
};

type ButtonAsChildProps = {
    children: ReactElement<ButtonChildProps>;
    className?: string;
    variant?: "primary" | "secondary" | "ghost";
    inactive?: boolean;
    asChild: true;
};

const variants = {
    primary: "border-[var(--color-black)] bg-primary text-black shadow-[4px_4px_0_var(--color-orange-dark)]",
    secondary: "border-[var(--color-orange-dark)] bg-[var(--color-black)] text-[var(--color-orange)] shadow-[4px_4px_0_var(--color-black)]",
    ghost: "border-[var(--color-alpha-zero)] bg-[var(--color-alpha-zero)] text-[var(--color-orange)] shadow-none hover:text-primary-light",
};

function buttonClassName(variant: NonNullable<ButtonProps["variant"]>, className?: string) {
    return cn("relative inline-flex cursor-pointer items-center justify-center gap-[.65rem] border-[3px] px-4 py-3 font-black uppercase tracking-[.14em] transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45 data-[inactive=true]:cursor-not-allowed data-[inactive=true]:opacity-45", variants[variant], className);
}

export function Button(props: ButtonProps | ButtonAsChildProps) {
    const { variant = "primary", className, children } = props;
    const inactive = props.inactive ?? false;
    const classes = buttonClassName(variant, className);

    if (props.asChild) {
        return cloneElement(props.children, {
            className: cn(classes, props.children.props.className),
            "aria-disabled": inactive || undefined,
            "data-inactive": inactive ? "true" : undefined,
        });
    }

    const { variant: _variant, className: _className, asChild: _asChild, children: _children, inactive: _inactive, disabled, ...buttonProps } = props;

    return (
        <button className={classes} disabled={inactive || disabled} {...buttonProps}>
            {typeof children === "string" || typeof children === "number" ? renderTextWithNumericFont(children) : children}
        </button>
    );
}
