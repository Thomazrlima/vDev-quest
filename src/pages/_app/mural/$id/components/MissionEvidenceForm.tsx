import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { AlertIcon, SparkIcon } from "@/components/icons";
import { EvidenceDropzone } from "./EvidenceDropzone";
import { EVIDENCE_INPUTS, type MuralMission } from "@/types/mission";
import { isEvidenceLink } from "@/utils/mural";

/** Cada tipo de evidência pede um campo diferente, com o texto que explica o que se espera. */
const fieldCopy = {
    link: { label: "Endereço da evidência", placeholder: "https://...", description: "Cole um endereço que o gestor consiga abrir, como o do pull request ou do documento." },
    text: { label: "Relato da entrega", placeholder: "Conte o que foi feito, onde está e quem participou...", description: "Descreva a entrega com detalhes suficientes para o gestor avaliar sem precisar perguntar." },
} as const;

type MissionEvidenceFormProps = {
    mission: MuralMission;
    submitting: boolean;
    /** O erro que veio do envio; o de validação é do próprio formulário. */
    submitError?: string | null;
    onSubmit: (evidence: FormData) => void;
    onCancel: () => void;
};

/** O corpo do modal de nova evidência: um campo por tipo, a mesma validação para todos. */
export function MissionEvidenceForm({ mission, submitting, submitError, onSubmit, onCancel }: MissionEvidenceFormProps) {
    const input = EVIDENCE_INPUTS[mission.evidenceType];
    const [file, setFile] = useState<File | null>(null);
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    // O botão só acende com a evidência em mãos, como pede o cenário 4 da FE-06.
    const filled = input.kind === "file" ? Boolean(file) : Boolean(value.trim());

    function validate() {
        if (input.kind === "file") return file ? null : "Anexe o arquivo pedido por esta missão.";
        if (!value.trim()) return input.kind === "link" ? "Informe o endereço da evidência." : "Escreva o relato da entrega.";
        if (input.kind === "link" && !isEvidenceLink(value)) return "Informe um endereço completo, começando com http:// ou https://.";
        return null;
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const problem = validate();
        setError(problem);
        if (problem) return;

        // O mesmo corpo que a BE-06 receberá: multipart quando há anexo, campo de texto quando não.
        const evidence = new FormData();
        evidence.append("missionId", mission.id);
        evidence.append("evidenceType", mission.evidenceType);
        evidence.append("kind", input.kind);
        if (input.kind === "file" && file) evidence.append("file", file);
        else evidence.append("value", value.trim());

        onSubmit(evidence);
    }

    function updateValue(next: string) {
        setValue(next);
        setError(null);
    }

    return (
        <form onSubmit={submit} noValidate>
            <fieldset disabled={submitting} className="grid gap-5 bg-black-overlay p-5 sm:p-6">
                {submitError ? (
                    <Alert tone="error" title="Não foi possível enviar" icon={<AlertIcon className="h-4 w-4" />}>
                        {submitError}
                    </Alert>
                ) : null}

                {input.kind === "file" ? (
                    <EvidenceDropzone
                        evidenceType={mission.evidenceType}
                        input={input}
                        file={file}
                        error={error}
                        disabled={submitting}
                        onSelect={(next) => {
                            setFile(next);
                            setError(null);
                        }}
                        onInvalid={(message) => {
                            setFile(null);
                            setError(message);
                        }}
                    />
                ) : input.kind === "link" ? (
                    <Input label={fieldCopy.link.label} description={fieldCopy.link.description} error={error ?? undefined} type="url" inputMode="url" value={value} onChange={(event) => updateValue(event.target.value)} placeholder={fieldCopy.link.placeholder} required />
                ) : (
                    <TextArea label={fieldCopy.text.label} description={fieldCopy.text.description} error={error ?? undefined} value={value} onChange={(event) => updateValue(event.target.value)} placeholder={fieldCopy.text.placeholder} rows={6} required />
                )}
            </fieldset>

            <div className="flex flex-col-reverse gap-3 border-t-2 border-primary-dark bg-black px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting} className="border-primary-dark px-4 text-[10px] text-primary-light">
                    Cancelar
                </Button>
                <Button type="submit" inactive={!filled || submitting} title={!filled ? "Preencha a evidência para enviar" : undefined} className="min-w-32 px-4 text-[10px] shadow-[4px_4px_0_var(--color-primary-dark)]">
                    {submitting ? (
                        <>
                            <SparkIcon className="h-4 w-4 animate-spin" /> Enviando
                        </>
                    ) : (
                        "Submeter"
                    )}
                </Button>
            </div>
        </form>
    );
}
