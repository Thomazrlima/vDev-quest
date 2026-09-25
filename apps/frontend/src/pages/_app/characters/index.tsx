import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkle } from "pixelarticons/react";
import { createFileRoute } from "@tanstack/react-router";
import { CharacterLayersPanel } from "./components/CharacterLayersPanel";
import { CharacterPresetPanel } from "./components/CharacterPresetPanel";
import { CharacterPreview } from "./components/CharacterPreview";
import { EMPTY_MANA_SEED_APPEARANCE } from "@/mocks/data/mana-seed";
import { QuestLoader } from "@/components/ui/QuestLoader";
import type { BodyType, CharacterPreset, ManaSeedAppearance, ManaSeedColors, ManaSeedLayer, ManaSeedSlot } from "@/types/character";
import type { StoredCharacter } from "@/utils/character-storage";
import { useStoredCharacter } from "@/utils/use-stored-character";
import { avatarService } from "@/api/avatar";
import { cycleManaSeedSlot, getManaSeedLayers } from "@/utils/mana-seed";
import { useSpritesReady } from "@/utils/use-sprites-ready";

const CHARACTER_DRAFT_KEY = "vdev-quest-character-draft";

function readCharacterDraft(): StoredCharacter | null {
    try {
        const value = sessionStorage.getItem(CHARACTER_DRAFT_KEY);
        return value ? JSON.parse(value) as StoredCharacter : null;
    } catch {
        return null;
    }
}

export const Route = createFileRoute("/_app/characters/")({
    component: CharacterCreatorPage,
});

function CharacterCreatorPage() {
    const storedCharacter = useStoredCharacter();
    if (storedCharacter.error) return <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-370 px-4 py-7 text-sm text-red-light" role="alert">{storedCharacter.error.message}</main>;
    if (!storedCharacter.ready) return <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-370 items-center justify-center px-4 py-7 sm:px-6 sm:py-9"><QuestLoader hint="Costurando os trajes" label="Preparando a oficina..." /></main>;
    return <CharacterEditor initial={storedCharacter} />;
}

function CharacterEditor({ initial }: { initial: StoredCharacter }) {
    const queryClient = useQueryClient();
    const initialCharacter: StoredCharacter = { appearance: initial.appearance, name: initial.name, colors: initial.colors, bodyType: initial.bodyType };
    const [draft] = useState(readCharacterDraft);
    const [appearance, setAppearance] = useState<ManaSeedAppearance>(draft?.appearance ?? initialCharacter.appearance);
    const [name, setName] = useState(draft?.name ?? initialCharacter.name);
    const [bodyType, setBodyType] = useState<BodyType>(draft?.bodyType ?? initialCharacter.bodyType);
    const [activePreset, setActivePreset] = useState("");
    const [colors, setColors] = useState<ManaSeedColors>(draft?.colors ?? initialCharacter.colors);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(() => Boolean(draft && JSON.stringify(draft) !== JSON.stringify(initialCharacter)));
    const [saveError, setSaveError] = useState<string | null>(null);
    const lastSaved = useRef(JSON.stringify(initialCharacter));
    const latest = useRef(JSON.stringify(draft ?? initialCharacter));
    const draftRef = useRef<StoredCharacter>(draft ?? initialCharacter);
    const saveQueue = useRef<Promise<void>>(Promise.resolve());
    const saveRevision = useRef(0);
    const layers = useMemo(() => getManaSeedLayers(appearance, bodyType, colors), [appearance, bodyType, colors]);
    const spritesReady = useSpritesReady(layers);
    /**
     * A montagem que está na tela, que só avança quando a próxima pode ser pintada inteira. Uma
     * peça recolorida passa por um canvas antes de virar textura, e até a pintura terminar o
     * desenho cai na folha original — trocar na hora fazia o pre-set piscar nas rampas de teste.
     * `null` é a primeira carga, quando ainda não há herói nenhum para segurar no lugar.
     */
    const [paintedLayers, setPaintedLayers] = useState<readonly ManaSeedLayer[] | null>(null);

    // Ajuste no render, não em efeito: a troca não pode passar por um quadro já commitado na tela,
    // que é justamente o piscar que se quer evitar.
    if (spritesReady && paintedLayers !== layers) setPaintedLayers(layers);

    useEffect(() => {
        const next: StoredCharacter = { appearance, name, colors, bodyType };
        const signature = JSON.stringify(next);
        latest.current = signature;
        if (signature === lastSaved.current) {
            if (sessionStorage.getItem(CHARACTER_DRAFT_KEY) === signature) sessionStorage.removeItem(CHARACTER_DRAFT_KEY);
            setDirty(false);
            return;
        }
        sessionStorage.setItem(CHARACTER_DRAFT_KEY, signature);
        const timer = window.setTimeout(() => {
            const revision = ++saveRevision.current;
            setSaving(true);
            setSaveError(null);
            const operation = saveQueue.current.catch(() => undefined).then(() => avatarService.save(next)).then(async () => {
                lastSaved.current = signature;
                if (latest.current === signature) {
                    if (sessionStorage.getItem(CHARACTER_DRAFT_KEY) === signature) sessionStorage.removeItem(CHARACTER_DRAFT_KEY);
                    setDirty(false);
                }
                queryClient.setQueryData(["character"], next);
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
                    queryClient.invalidateQueries({ queryKey: ["ranking"] }),
                ]);
            }).catch((cause: unknown) => { if (revision === saveRevision.current) setSaveError(cause instanceof Error ? cause.message : "Não foi possível salvar o personagem."); }).finally(() => { if (revision === saveRevision.current) setSaving(false); });
            saveQueue.current = operation;
        }, 500);
        return () => window.clearTimeout(timer);
    }, [appearance, bodyType, colors, name, queryClient]);

    useEffect(() => {
        const warnOnRefresh = (event: BeforeUnloadEvent) => {
            if (latest.current === lastSaved.current) return;
            event.preventDefault();
        };
        window.addEventListener("beforeunload", warnOnRefresh);
        return () => window.removeEventListener("beforeunload", warnOnRefresh);
    }, []);

    function updateDraft(changes: Partial<StoredCharacter>) {
        const next = { ...draftRef.current, ...changes };
        draftRef.current = next;
        latest.current = JSON.stringify(next);
        sessionStorage.setItem(CHARACTER_DRAFT_KEY, latest.current);
        setDirty(true);
    }

    function changeName(value: string) {
        updateDraft({ name: value });
        setName(value);
    }

    function changeBodyType(value: BodyType) {
        updateDraft({ bodyType: value });
        setBodyType(value);
    }

    function rotate(slot: ManaSeedSlot, direction: -1 | 1) {
        setActivePreset("");
        const next = cycleManaSeedSlot(appearance, slot, direction);
        updateDraft({ appearance: next });
        setAppearance(next);
    }

    function changeColor(target: ManaSeedSlot | "skin", index: number) {
        setActivePreset("");
        const next = { ...colors, [target]: index };
        updateDraft({ colors: next });
        setColors(next);
    }

    function selectPreset(preset: CharacterPreset) {
        updateDraft({ appearance: preset.appearance, colors: preset.colors });
        setAppearance(preset.appearance);
        setColors(preset.colors);
        setActivePreset(preset.id);
    }

    function reset() {
        setActivePreset("");
        updateDraft({ appearance: EMPTY_MANA_SEED_APPEARANCE });
        setAppearance(EMPTY_MANA_SEED_APPEARANCE);
    }

    // A oficina abre inteira ou não abre: mostrar os painéis antes das folhas chegarem deixava
    // o herói montando peça por peça, e nas cores erradas, no canto da tela.
    if (!paintedLayers) {
        return (
            <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-370 items-center justify-center px-4 py-7 sm:px-6 sm:py-9">
                <QuestLoader hint="Costurando os trajes" label="Preparando a oficina..." />
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-9rem)] bg-[url('/images/backgrounds/Criador.png')] bg-cover bg-fixed bg-center text-[var(--color-primary-dark)]">
            <div className="mx-auto max-w-370 px-4 py-7 sm:px-6 sm:py-9">
            <div className="flex items-center justify-center gap-[.8rem] text-[.65rem] font-black uppercase tracking-[.22em] text-primary before:h-0.5 before:w-[min(16vw,140px)] before:bg-[linear-gradient(90deg,var(--color-alpha-zero),var(--color-primary-dark))] after:h-0.5 after:w-[min(16vw,140px)] after:bg-[linear-gradient(90deg,var(--color-primary-dark),var(--color-alpha-zero))]">
                <Sparkle className="h-3 w-3" />
                <p>Oficina de aventuras</p>
                <Sparkle className="h-3 w-3" />
            </div>
            <div className="mt-2 grid gap-5 xl:grid-cols-[285px_minmax(360px,1fr)_350px] xl:items-stretch">
                <CharacterPresetPanel activePreset={activePreset} onPreset={selectPreset} />
                <CharacterPreview name={name} onNameChange={changeName} layers={paintedLayers} />
                <CharacterLayersPanel bodyType={bodyType} appearance={appearance} colors={colors} onBodyTypeChange={changeBodyType} onRotate={rotate} onColorChange={changeColor} onReset={reset} />
            </div>
            <footer className="mt-6 flex justify-center">
                <p role={saveError ? "alert" : "status"} className="text-center text-[10px] font-black uppercase tracking-[.16em] text-[var(--color-primary-dark)]">{saveError ?? (saving ? "Salvando alterações..." : dirty ? "Alterações pendentes de salvamento..." : "Alterações salvas automaticamente")}</p>
            </footer>
            </div>
        </main>
    );
}
