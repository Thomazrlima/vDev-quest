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
    primary: "border-primary-light bg-primary text-black shadow-[0_3px_0_var(--color-primary-dark)] hover:-translate-y-px hover:shadow-[0_4px_0_var(--color-primary-dark)] active:translate-y-px active:shadow-none",
    secondary: "border-primary-dark bg-[rgb(15_14_14/90%)] text-primary-light hover:border-primary hover:bg-primary-overlay",
    ghost: "border-[var(--color-alpha-zero)] bg-[var(--color-alpha-zero)] text-primary shadow-none hover:text-primary-light",
};

function buttonClassName(variant: NonNullable<ButtonProps["variant"]>, className?: string) {
    return cn("relative inline-flex cursor-pointer items-center justify-center gap-[.65rem] border-2 px-4 py-3 text-[.72rem] font-black tracking-[.06em] transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-light disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45 data-[inactive=true]:cursor-not-allowed data-[inactive=true]:opacity-45", variants[variant], className);
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
