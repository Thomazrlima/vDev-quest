import { useId } from "react";
import ReactSelect from "react-select";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";

export type SelectOption = { value: string; label: string };

type SelectProps = {
    id?: string;
    label?: string;
    error?: string;
    description?: string;
    containerClassName?: string;
    className?: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    name?: string;
};

export function Select({ id, label, error, description, containerClassName, className, options, value, onChange, onBlur, placeholder = "Selecione uma opção", required, disabled, name }: SelectProps) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    // O react-select trabalha com o objeto inteiro; a tela continua falando só o valor.
    const selected = options.find((option) => option.value === value) ?? null;

    return (
        <div className={cn("block", containerClassName)}>
            {label ? (
                <label htmlFor={selectId} className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-primary-light">
                    {renderTextWithNumericFont(label)}
                    {required ? <span className="text-primary"> *</span> : null}
                </label>
            ) : null}
            <ReactSelect
                unstyled
                inputId={selectId}
                name={name}
                options={options}
                value={selected}
                onChange={(option) => onChange(option?.value ?? "")}
                onBlur={onBlur}
                placeholder={placeholder}
                isDisabled={disabled}
                required={required}
                menuPlacement="auto"
                // Em modo unstyled o react-select não traz estilo nenhum, nem o posicionamento
                // do menu: o absolute/z-index abaixo é o que o faz flutuar sobre os campos.
                classNames={{
                    container: () => "relative",
                    control: ({ isFocused, isDisabled }) => cn("flex w-full cursor-pointer items-center gap-2 border-2 bg-[var(--color-black)] px-4 py-3 text-sm text-white transition", isFocused ? "border-primary" : error ? "border-[var(--color-orange)]" : "border-[var(--color-primary-dark)]", isDisabled && "cursor-not-allowed border-[var(--color-black-soft)] text-[var(--color-black-muted)]", className),
                    valueContainer: () => "flex min-w-0 flex-1 items-center",
                    singleValue: () => "truncate",
                    placeholder: () => "truncate text-[var(--color-white-muted)]",
                    input: () => "text-white",
                    indicatorsContainer: () => "flex shrink-0 items-center",
                    indicatorSeparator: () => "hidden",
                    dropdownIndicator: ({ isDisabled }) => cn("pl-2", isDisabled ? "text-[var(--color-black-muted)]" : "text-primary"),
                    menu: () => "absolute left-0 top-full z-50 mt-1 w-full border-2 border-primary bg-[var(--color-black)] shadow-[5px_5px_0_var(--color-black-overlay)]",
                    menuList: () => "max-h-60 overflow-y-auto py-1",
                    option: ({ isFocused, isSelected }) => cn("cursor-pointer px-4 py-2.5 text-sm transition", isSelected ? "bg-[var(--color-primary-dark)] font-black text-primary-light" : isFocused ? "bg-primary-overlay text-primary-light" : "text-[var(--color-white-soft)]"),
                    noOptionsMessage: () => "px-4 py-3 text-xs text-[var(--color-white-muted)]",
                }}
            />
            {description ? <span className="mt-2 block text-[11px] text-[var(--color-white-muted)]">{renderTextWithNumericFont(description)}</span> : null}
            {error ? (
                <span role="alert" className="mt-2 block text-[11px] font-bold text-[var(--color-orange)]">
                    {renderTextWithNumericFont(error)}
                </span>
            ) : null}
        </div>
    );
}
