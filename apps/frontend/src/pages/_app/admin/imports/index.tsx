import { useId, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { mutationKey } from "@/api/client";
import { importErrors, importService } from "@/api/imports";
import { missionService } from "@/api/missions";
import { ChevronIcon, UploadIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";

export const Route = createFileRoute("/_app/admin/imports/")({ component: ImportPage });

const MAX_FILE_BYTES = 3 * 1024 * 1024;

function ImportPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const uploadKey = useRef(mutationKey());
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { data: missions = [], isPending: missionsLoading, error: missionsError } = useQuery({ queryKey: ["missions"], queryFn: missionService.list });
    const eligible = missions.filter((mission) => mission.status === "Ativa" && mission.recurrenceType === "none" && !mission.isCheckin);
    const upload = useMutation({
        mutationFn: ({ selected, key }: { selected: File; key: `${string}-${string}-${string}-${string}-${string}` }) => importService.upload(selected, key),
        onSuccess: async () => {
            await Promise.all(["missions", "mural", "profile", "ranking", "admin"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
            setFile(null);
            uploadKey.current = mutationKey();
            if (inputRef.current) inputRef.current.value = "";
        },
    });

    function selectFile(next: File | null) {
        setFile(next);
        setFileError(null);
        upload.reset();
        uploadKey.current = mutationKey();
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!file || !file.name.toLowerCase().endsWith(".xlsx")) { setFileError("Selecione uma planilha .xlsx."); return; }
        if (file.size === 0 || file.size > MAX_FILE_BYTES) { setFileError("A planilha deve ter entre 1 byte e 3 MB."); return; }
        setFileError(null);
        upload.mutate({ selected: file, key: uploadKey.current });
    }

    async function copyId(id: string) {
        try { await navigator.clipboard.writeText(id); setCopiedId(id); }
        catch { setCopiedId(null); }
    }

    const report = importErrors(upload.error);
    return <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
        <StoneWall><div className="mx-auto w-[min(1000px,100%)]">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/missions" })} className="mb-7 p-0 text-[11px] text-primary hover:text-primary-light"><ChevronIcon className="h-4 w-4 rotate-180" /> Gestão de missões</Button>
            <PageHeader eyebrow="Gestão da guilda" title="Importar fases" description="Registre conclusões externas em uma única planilha. Se alguma linha estiver incorreta, nada será gravado." />
            <Card as="form" onSubmit={submit} className={`${HALL_PANEL} mt-8 overflow-hidden`}>
                <div className="border-b-2 border-primary-dark bg-black px-5 py-4 sm:px-7"><h2 className="text-base font-black text-primary-light">Planilha de conclusões</h2><p className="mt-1 text-xs text-white-muted">A primeira linha deve conter, nesta ordem: <code className="text-primary-light">mission_id, email, phase</code>. Somente missões comuns, não recorrentes, podem ser importadas.</p></div>
                <div className="bg-black-overlay p-5 sm:p-7">
                    <label htmlFor={fileId} className="block text-xs font-black text-primary-light">Arquivo .xlsx *</label>
                    <input ref={inputRef} id={fileId} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} aria-describedby={`${fileId}-help ${fileError ? `${fileId}-error` : ""}`} className="mt-3 block w-full cursor-pointer border-2 border-primary-dark bg-black p-3 text-sm text-white file:mr-4 file:border-0 file:bg-primary-dark file:px-3 file:py-2 file:font-black file:text-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light" />
                    <p id={`${fileId}-help`} className="mt-2 text-xs text-white-muted">Até 3 MB. Cada linha concede a EXP da fase indicada; não é criada evidência.</p>
                    {fileError ? <p id={`${fileId}-error`} role="alert" className="mt-3 text-xs font-bold text-(--color-danger)">{fileError}</p> : null}
                </div>
                <div className="flex justify-end border-t-2 border-primary-dark bg-black px-5 py-4 sm:px-7"><Button type="submit" disabled={upload.isPending || !file} className="px-5 text-xs"><UploadIcon className="h-4 w-4" />{upload.isPending ? "Importando..." : "Importar planilha"}</Button></div>
            </Card>

            {upload.isSuccess ? <p role="status" className="mt-6 border-l-4 border-green bg-green-overlay px-5 py-4 text-sm font-bold text-green-light">{upload.data.imported} {upload.data.imported === 1 ? "linha importada" : "linhas importadas"}. As recompensas já aparecem no perfil e no ranking.</p> : null}
            {upload.error ? <Card as="section" aria-labelledby="import-report-title" className={`${HALL_PANEL} mt-6 overflow-hidden`}>
                <div className="border-b-2 border-(--color-danger-dark) bg-danger-overlay px-5 py-4 sm:px-7"><h2 id="import-report-title" className="text-base font-black text-(--color-danger-light)">Importação não realizada</h2><p role="alert" className="mt-1 text-xs text-(--color-danger-light)">{upload.error.message}</p></div>
                {report.length ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-black text-xs text-primary-light"><tr><th className="px-5 py-3">Linha</th><th className="px-5 py-3">Campo</th><th className="px-5 py-3">Como corrigir</th></tr></thead><tbody>{report.map((issue, index) => <tr key={`${issue.line}-${issue.field}-${index}`} className="border-t border-primary-dark bg-black-overlay text-white-soft"><td className="px-5 py-3 font-bold text-primary-light">{issue.line || "Arquivo"}</td><td className="px-5 py-3"><code>{issue.field}</code></td><td className="px-5 py-3">{issue.reason}</td></tr>)}</tbody></table></div> : null}
            </Card> : null}

            <Card as="section" aria-labelledby="mission-ids-title" className={`${HALL_PANEL} mt-8 overflow-hidden`}>
                <div className="border-b-2 border-primary-dark bg-black px-5 py-4 sm:px-7"><h2 id="mission-ids-title" className="text-base font-black text-primary-light">Identificadores de missão</h2><p className="mt-1 text-xs text-white-muted">Copie o ID para a coluna <code>mission_id</code> da planilha.</p></div>
                {missionsError ? <p role="alert" className="p-5 text-xs text-(--color-danger)">{missionsError.message}</p> : missionsLoading ? <p role="status" className="p-5 text-xs text-white-muted">Carregando missões...</p> : !eligible.length ? <p className="p-5 text-sm text-white-muted">Nenhuma missão apta à importação. Crie uma missão comum sem recorrência para começar.</p> : <ul className="divide-y divide-primary-dark bg-black-overlay">{eligible.map((mission) => <li key={mission.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><span className="min-w-0"><strong className="block text-sm text-primary-light">{mission.title}</strong><code className="mt-1 block break-all text-xs text-white-muted">{mission.id}</code></span><Button type="button" variant="secondary" onClick={() => copyId(mission.id)} className="shrink-0 border-primary-dark px-3 py-2 text-[10px]">{copiedId === mission.id ? "Copiado" : "Copiar ID"}</Button></li>)}</ul>}
            </Card>
        </div></StoneWall>
    </main>;
}
