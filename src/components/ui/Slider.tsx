import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/tailwind";

type SliderItemRenderProps<Value extends string> = {
    active: boolean;
    indicator: ReactNode;
    select: () => void;
    value: Value;
};

type SliderProps<Item, Value extends string> = {
    items: readonly Item[];
    value: Value;
    getValue: (item: Item) => Value;
    onValueChange: (value: Value) => void;
    className?: string;
    indicatorClassName?: string;
    children: (item: Item, props: SliderItemRenderProps<Value>) => ReactNode;
};

export function Slider<Item, Value extends string>({ items, value, getValue, onValueChange, className, indicatorClassName, children }: SliderProps<Item, Value>) {
    const layoutId = `slider-indicator-${useId()}`;

    return (
        <div className={className}>
            {items.map((item) => {
                const itemValue = getValue(item);
                const active = itemValue === value;
                const indicator = active ? <motion.span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 z-0", indicatorClassName)} layoutId={layoutId} transition={{ type: "spring", stiffness: 520, damping: 38 }} /> : null;

                return children(item, {
                    active,
                    indicator,
                    select: () => onValueChange(itemValue),
                    value: itemValue,
                });
            })}
        </div>
    );
}
