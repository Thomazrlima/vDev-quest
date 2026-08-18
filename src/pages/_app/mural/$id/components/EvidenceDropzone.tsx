import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CloseIcon, EvidenceIcon, UploadIcon } from "@/components/icons";
import { cn } from "@/lib/tailwind";
import { renderTextWithNumericFont } from "@/lib/typography";
import type { EvidenceInput, EvidenceType } from "@/types/mission";
import { MAX_EVIDENCE_SIZE_IN_MB, formatExtensions, formatFileSize, validateEvidenceFile } from "@/utils/mural";

type EvidenceDropzoneProps = {
    evidenceType: EvidenceType;
    input: Extract<EvidenceInput, { kind: "file" }>;
    file: File | null;
    error?: string | null;
    disabled?: boolean;
    onSelect: (file: File | null) => void;
    /** O arquivo recusado nunca vira anexo: a tela só recebe o motivo para mostrar. */
    onInvalid: (message: string) => void;
};

/** O campo de anexo da missão: aceita arrastar e soltar, clique e teclado. */
export function EvidenceDropzone({ evidenceType, input, file, error, disabled = false, onSelect, onInvalid }: EvidenceDropzoneProps) {
    const inputId = useId();
    const fieldRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function pick(candidate: File | undefined) {
        if (!candidate) return;
        const problem = validateEvidenceFile(candidate, input);
        if (problem) {
            clear();
            onInvalid(problem);
            return;
        }
        onSelect(candidate);
    }

    function clear() {
        // Sem zerar o value, escolher de novo o mesmo arquivo não dispara o change do input.
        if (fieldRef.current) fieldRef.current.value = "";
        onSelect(null);
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        pick(event.target.files?.[0]);
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        pick(event.dataTransfer.files[0]);
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        if (!disabled) setDragging(true);
    }

    return (
        <div className="block">
            {/* O rótulo continua ligado ao input mesmo com o anexo escolhido, quando o texto de dentro some. */}
            <label htmlFor={inputId} className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-primary-light">
                Arquivo da evidência<span className="text-primary"> *</span>
            </label>
            <div onDragOver={handleDragOver} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={cn("border-2 border-dashed bg-(--color-black) transition has-[input:focus-visible]:border-primary", error ? "border-(--color-orange)" : dragging ? "border-primary bg-primary-overlay" : "border-primary-dark", disabled && "cursor-not-allowed opacity-60")}>
                <input ref={fieldRef} id={inputId} type="file" accept={input.accept} disabled={disabled} onChange={handleChange} className="sr-only" />

                {file ? (
                    <div className="flex items-center gap-3 p-4">
                        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center border-2 border-primary bg-black text-primary">
                            <EvidenceIcon type={evidenceType} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-primary-light">{file.name}</p>
                            <p className="mt-0.5 text-[.65rem] uppercase tracking-[.1em] text-white-muted">{renderTextWithNumericFont(formatFileSize(file.size))}</p>
                        </div>
                        <button type="button" onClick={clear} disabled={disabled} aria-label={`Remover o arquivo ${file.name}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center border-2 border-primary-dark text-primary transition hover:border-(--color-orange) hover:text-(--color-orange-light) disabled:cursor-not-allowed">
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <label htmlFor={inputId} className={cn("flex flex-col items-center gap-2 px-6 py-9 text-center", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                        <span aria-hidden="true" className="grid h-12 w-12 place-items-center border-2 border-primary bg-black text-primary">
                            <UploadIcon className="h-6 w-6" />
                        </span>
                        <span className="text-xs font-black uppercase tracking-[.1em] text-primary-light">Arraste o arquivo ou clique para escolher</span>
                        <span className="text-[.65rem] text-white-muted">{renderTextWithNumericFont(`${formatExtensions(input.extensions)} de até ${MAX_EVIDENCE_SIZE_IN_MB} MB`)}</span>
                    </label>
                )}
            </div>
            {error ? (
                <span role="alert" className="mt-2 block text-[11px] font-bold text-(--color-orange)">
                    {renderTextWithNumericFont(error)}
                </span>
            ) : null}
        </div>
    );
}
