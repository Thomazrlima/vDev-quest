import { Fragment, type ReactNode } from "react";

export function renderTextWithNumericFont(value: string | number | null | undefined): ReactNode {
    if (value === null || value === undefined) return null;

    return String(value).split(/(\d+)/).map((part, index) => (
        <Fragment key={`${part}-${index}`}>
            {/^\d+$/.test(part) ? <span className="font-numeric">{part}</span> : part}
        </Fragment>
    ));
}
