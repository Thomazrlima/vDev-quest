import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CharacterLayersPanel } from "./components/CharacterLayersPanel";
import { CharacterPresetPanel } from "./components/CharacterPresetPanel";
import { CharacterPreview } from "./components/CharacterPreview";
import { CHARACTER_AURAS } from "@/mocks/data/character-options";
import { DEFAULT_MANA_SEED_COLORS, EMPTY_MANA_SEED_APPEARANCE } from "@/mocks/data/mana-seed";
import { Button } from "@/components/ui/Button";
import type { BodyType, CharacterPreset, ManaSeedAppearance, ManaSeedColors, ManaSeedSlot } from "@/types/character";
import { readStoredCharacter, saveStoredCharacter } from "@/utils/character-storage";
import { cycleManaSeedSlot, getManaSeedLayers } from "@/utils/mana-seed";

export const Route = createFileRoute("/_app/characters/")({
    component: CharacterCreatorPage,
});

function CharacterCreatorPage() {
    const navigate = useNavigate();
    // O vilarejo monta o avatar a partir do mesmo registro: a oficina abre no que já foi escolhido.
    const [storedCharacter] = useState(readStoredCharacter);
    const [appearance, setAppearance] = useState<ManaSeedAppearance>(storedCharacter.appearance);
    const [name, setName] = useState(storedCharacter.name);
    const [bodyType, setBodyType] = useState<BodyType>("hero");
    // No class picker on this page any more; the preview still labels the default class.
    const [aura] = useState(CHARACTER_AURAS[0]);
    const [activePreset, setActivePreset] = useState("");
    const [colors, setColors] = useState<ManaSeedColors>(DEFAULT_MANA_SEED_COLORS);
    const layers = useMemo(() => getManaSeedLayers(appearance, bodyType, colors), [appearance, bodyType, colors]);

    useEffect(() => {
        saveStoredCharacter({ appearance, name });
    }, [appearance, name]);

    function rotate(slot: ManaSeedSlot, direction: -1 | 1) {
        setActivePreset("");
        setAppearance((current) => cycleManaSeedSlot(current, slot, direction));
    }

    function changeColor(target: ManaSeedSlot | "skin", index: number) {
        setActivePreset("");
        setColors((current) => ({ ...current, [target]: index }));
    }

    function selectPreset(preset: CharacterPreset) {
        setAppearance(preset.appearance);
        setColors(preset.colors);
        setActivePreset(preset.id);
    }

    function reset() {
        setActivePreset("");
        setAppearance(EMPTY_MANA_SEED_APPEARANCE);
    }

    return (
        <main className="mx-auto max-w-370 px-4 py-7 sm:px-6 sm:py-9 text-[var(--color-orange-dark)]">
            <div className="flex items-center justify-center gap-[.8rem] text-[.65rem] font-black uppercase tracking-[.22em] text-[var(--color-orange)] before:h-0.5 before:w-[min(16vw,140px)] before:bg-[linear-gradient(90deg,var(--color-alpha-zero),var(--color-orange-dark))] after:h-0.5 after:w-[min(16vw,140px)] after:bg-[linear-gradient(90deg,var(--color-orange-dark),var(--color-alpha-zero))]">
                <span>✦</span>
                <p>Oficina de aventuras</p>
                <span>✦</span>
            </div>
            <div className="mt-2 grid gap-5 xl:grid-cols-[285px_minmax(360px,1fr)_350px] xl:items-stretch">
                <CharacterPresetPanel activePreset={activePreset} onPreset={selectPreset} />
                <CharacterPreview name={name} aura={aura} bodyType={bodyType} layers={layers} />
                <CharacterLayersPanel name={name} bodyType={bodyType} appearance={appearance} colors={colors} onNameChange={setName} onBodyTypeChange={setBodyType} onRotate={rotate} onColorChange={changeColor} onReset={reset} />
            </div>
            <footer className="mt-6 flex items-center justify-between gap-4">
                <Button type="button" onClick={() => navigate({ to: "/perfil" })} className="min-w-33 border-4 border-[var(--color-orange-dark)] bg-[linear-gradient(var(--color-orange),var(--color-orange-dark))] px-5 py-3 text-[.65rem] tracking-[.13em] text-[var(--color-primary-light)] shadow-[inset_2px_2px_0_var(--color-white-overlay),4px_4px_0_var(--color-orange-overlay)]">
                    ‹ VOLTAR
                </Button>
                <p className="hidden text-center text-[10px] font-black uppercase tracking-[.16em] text-[var(--color-orange-dark)] sm:block">Escolhas atualizadas na prévia</p>
                <Button type="button" onClick={() => navigate({ to: "/perfil" })} className="min-w-33 border-4 border-[var(--color-blue-dark)] bg-[linear-gradient(var(--color-blue),var(--color-blue-dark))] px-5 py-3 text-[.65rem] tracking-[.13em] text-[var(--color-primary-light)] shadow-[inset_2px_2px_0_var(--color-blue-overlay),4px_4px_0_var(--color-black-overlay)]">
                    CONTINUAR ›
                </Button>
            </footer>
        </main>
    );
}
