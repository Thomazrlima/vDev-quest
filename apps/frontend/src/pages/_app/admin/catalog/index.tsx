import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { catalogService, type CatalogEntry } from "@/api/catalog";
import { mutationKey } from "@/api/client";
import { ChevronIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { BLEED_UNDER_RETURN_LINK, HALL_PANEL, StoneWall } from "@/components/ui/StoneWall";
import { TextArea } from "@/components/ui/TextArea";
import { cn } from "@/lib/tailwind";

export const Route = createFileRoute("/_app/admin/catalog/")({ component: CatalogPage });

type Kind = "titles" | "badges";

function CatalogPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [kind, setKind] = useState<Kind>("titles");
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");
    const [imagePath, setImagePath] = useState("");
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [lastCreated, setLastCreated] = useState<string | null>(null);
    const requestKey = useRef(mutationKey());
    const { data: titles = [], isPending: titlesLoading, error: titlesError } = useQuery({ queryKey: ["catalog", "titles"], queryFn: catalogService.titles });
    const { data: badges = [], isPending: badgesLoading, error: badgesError } = useQuery({ queryKey: ["catalog", "badges"], queryFn: catalogService.badges });
    const create = useMutation({
        mutationFn: ({ selected, key }: { selected: Kind; key: `${string}-${string}-${string}-${string}-${string}` }) => selected === "titles"
            ? catalogService.createTitle({ label: label.trim(), description: description.trim() }, key)
            : catalogService.createBadge({ label: label.trim(), description: description.trim(), imagePath: imagePath.trim() }, key),
        onSuccess: async (entry, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["catalog", variables.selected] });
            setLastCreated(entry.label);
            setLabel(""); setDescription(""); setImagePath("");
            requestKey.current = mutationKey();
        },
    });

    function edit(field: "label" | "description" | "imagePath", value: string) {
        if (field === "label") setLabel(value);
        if (field === "description") setDescription(value);
        if (field === "imagePath") setImagePath(value);
        setFieldError(null); setLastCreated(null); create.reset(); requestKey.current = mutationKey();
    }

    function select(next: Kind) {
        setKind(next); setLabel(""); setDescription(""); setImagePath("");
        setFieldError(null); setLastCreated(null); create.reset(); requestKey.current = mutationKey();
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!label.trim()) { setFieldError("Informe o nome antes de salvar."); return; }
        if (kind === "badges" && !imagePath.trim()) { setFieldError("Informe o caminho da imagem da insígnia."); return; }
        setFieldError(null);
        create.mutate({ selected: kind, key: requestKey.current });
    }

    const entries = kind === "titles" ? titles : badges;
    const loading = kind === "titles" ? titlesLoading : badgesLoading;
    const error = kind === "titles" ? titlesError : badgesError;
    const singular = kind === "titles" ? "título" : "insígnia";
    return <main className={`flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) ${BLEED_UNDER_RETURN_LINK}`}>
        <StoneWall><div className="mx-auto w-[min(1000px,100%)]">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/perfil" })} className="mb-7 p-0 text-[11px] text-primary hover:text-primary-light"><ChevronIcon className="h-4 w-4 rotate-180" /> Perfil</Button>
            <PageHeader eyebrow="Gestão da guilda" title="Títulos e insígnias" description="Cadastre os itens de reconhecimento disponíveis na guilda. A atribuição aos colaboradores não faz parte desta etapa." />
            <div className="mt-8 flex gap-2" role="group" aria-label="Tipo de catálogo">
                <Button type="button" variant={kind === "titles" ? "primary" : "secondary"} aria-pressed={kind === "titles"} onClick={() => select("titles")} className="min-w-28 px-4 py-2 text-xs">Títulos <span className="font-numeric">{titles.length}</span></Button>
                <Button type="button" variant={kind === "badges" ? "primary" : "secondary"} aria-pressed={kind === "badges"} onClick={() => select("badges")} className="min-w-28 px-4 py-2 text-xs">Insígnias <span className="font-numeric">{badges.length}</span></Button>
            </div>

            <Card as="form" onSubmit={submit} noValidate className={`${HALL_PANEL} mt-4 overflow-hidden`}>
                <div className="border-b-2 border-primary-dark bg-black px-5 py-4 sm:px-7"><h2 className="text-base font-black text-primary-light">Novo {singular}</h2><p className="mt-1 text-xs text-white-muted">O código é gerado automaticamente a partir do nome.</p></div>
                <fieldset disabled={create.isPending} className="grid gap-5 bg-black-overlay p-5 sm:p-7">
                    <Input label={`Nome do ${singular}`} value={label} onChange={(event) => edit("label", event.target.value)} maxLength={100} placeholder={kind === "titles" ? "Ex.: Guardião do código" : "Ex.: Primeira conquista"} error={fieldError?.includes("nome") ? fieldError : undefined} required />
                    <TextArea label="Descrição" value={description} onChange={(event) => edit("description", event.target.value)} maxLength={500} rows={3} placeholder="Descreva quando este reconhecimento se aplica." />
                    {kind === "badges" ? <Input label="Caminho da imagem" value={imagePath} onChange={(event) => edit("imagePath", event.target.value)} maxLength={255} placeholder="/images/insignias/minha-insignia.png" description="Use uma imagem publicada no frontend ou uma URL HTTPS. O arquivo não é enviado por este formulário." error={fieldError?.includes("imagem") ? fieldError : undefined} required /> : null}
                </fieldset>
                <div className="flex flex-col gap-3 border-t-2 border-primary-dark bg-black px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div aria-live="polite" className="text-xs">{create.error ? <p role="alert" className="text-(--color-danger-light)">{create.error.message}</p> : lastCreated ? <p className="text-green-light">{lastCreated} cadastrado com sucesso.</p> : null}</div>
                    <Button type="submit" disabled={create.isPending} className="px-5 text-xs">{create.isPending ? "Salvando..." : `Criar ${singular}`}</Button>
                </div>
            </Card>

            <Card as="section" aria-labelledby="catalog-list-title" className={`${HALL_PANEL} mt-8 overflow-hidden`}>
                <div className="border-b-2 border-primary-dark bg-black px-5 py-4 sm:px-7"><h2 id="catalog-list-title" className="text-base font-black text-primary-light">{kind === "titles" ? "Títulos cadastrados" : "Insígnias cadastradas"}</h2><p className="mt-1 text-xs text-white-muted">Consulta do catálogo; edição e exclusão não estão disponíveis nesta etapa.</p></div>
                {error ? <p role="alert" className="p-5 text-xs text-(--color-danger)">{error.message}</p> : loading ? <p role="status" className="p-5 text-xs text-white-muted">Carregando catálogo...</p> : !entries.length ? <p className="p-5 text-sm text-white-muted">Nenhum {singular} cadastrado. Use o formulário acima para começar.</p> : <ul className="divide-y divide-primary-dark bg-black-overlay">{entries.map((entry) => <CatalogRow key={entry.id} entry={entry} kind={kind} />)}</ul>}
            </Card>
        </div></StoneWall>
    </main>;
}

function CatalogRow({ entry, kind }: { entry: CatalogEntry; kind: Kind }) {
    return <li className="flex gap-4 px-5 py-4 sm:px-7">
        {kind === "badges" && entry.imagePath ? <span className="grid h-12 w-12 shrink-0 place-items-center border-2 border-primary-dark bg-black"><img src={entry.imagePath} alt={`Insígnia ${entry.label}`} loading="lazy" className="h-10 w-10 object-contain" /></span> : null}
        <div className="min-w-0"><strong className="block text-sm text-primary-light">{entry.label}</strong>{entry.description ? <p className="mt-1 text-xs leading-relaxed text-white-muted">{entry.description}</p> : null}<code className={cn("mt-1 block break-all text-xs text-primary", !entry.description && "mt-2")}>{entry.code}</code></div>
    </li>;
}
