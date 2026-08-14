import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CharacterLayersPanel } from "./components/CharacterLayersPanel";
import { CharacterPresetPanel } from "./components/CharacterPresetPanel";
import { CharacterPreview } from "./components/CharacterPreview";
import { CHARACTER_AURAS } from "@/mocks/data/character-options";
import { MANA_SEED_FREE } from "@/mocks/data/mana-seed";
import { Button } from "@/components/ui/Button";
import type { BodyType, CharacterPreset, ManaSeedAppearance } from "@/types/character";
import { readStoredCharacter, saveStoredCharacter } from "@/utils/character-storage";
import { getManaSeedLayers } from "@/utils/mana-seed";

export const Route = createFileRoute("/_app/characters/")({
    component: CharacterCreatorPage,
});

function cycle<T extends string>(options: readonly T[], current: T, direction: -1 | 1) {
    return options[(options.indexOf(current) + direction + options.length) % options.length];
}

function CharacterCreatorPage() {
    const navigate = useNavigate();
    // O vilarejo monta o avatar a partir do mesmo registro: a oficina abre no que já foi escolhido.
    const [storedCharacter] = useState(readStoredCharacter);
    const [appearance, setAppearance] = useState<ManaSeedAppearance>(storedCharacter.appearance);
    const [name, setName] = useState(storedCharacter.name);
    const [bodyType, setBodyType] = useState<BodyType>("hero");
    const [aura, setAura] = useState(CHARACTER_AURAS[0]);
    const [activePreset, setActivePreset] = useState("farmer");
    const layers = useMemo(() => getManaSeedLayers(appearance), [appearance]);

    useEffect(() => {
        saveStoredCharacter({ appearance, name });
    }, [appearance, name]);

    function rotate(part: keyof ManaSeedAppearance, direction: -1 | 1) {
        setActivePreset("");
        setAppearance((current) => {
            const options = Object.keys(part === "hair" ? MANA_SEED_FREE.hairstyles : part === "shirt" ? MANA_SEED_FREE.shirts : MANA_SEED_FREE.headwear) as ManaSeedAppearance[typeof part][];
            return { ...current, [part]: cycle(options, current[part], direction) };
        });
    }

    function selectPreset(preset: CharacterPreset) {
        setAppearance(preset.appearance);
        setActivePreset(preset.id);
    }

    return (
        <main className="mx-auto max-w-370 px-4 py-7 sm:px-6 sm:py-9 text-[var(--color-orange-dark)]">
            <div className="flex items-center justify-center gap-[.8rem] text-[.65rem] font-black uppercase tracking-[.22em] text-[var(--color-orange)] before:h-0.5 before:w-[min(16vw,140px)] before:bg-[linear-gradient(90deg,var(--color-alpha-zero),var(--color-orange-dark))] after:h-0.5 after:w-[min(16vw,140px)] after:bg-[linear-gradient(90deg,var(--color-orange-dark),var(--color-alpha-zero))]">
                <span>✦</span>
                <p>Oficina de aventuras</p>
                <span>✦</span>
            </div>
            <div className="mt-2 grid gap-5 xl:grid-cols-[285px_minmax(360px,1fr)_350px] xl:items-stretch">
                <CharacterPresetPanel activePreset={activePreset} aura={aura} onPreset={selectPreset} onAura={setAura} />
                <CharacterPreview name={name} aura={aura} bodyType={bodyType} layers={layers} />
                <CharacterLayersPanel
                    name={name}
                    bodyType={bodyType}
                    appearance={appearance}
                    onNameChange={setName}
                    onBodyTypeChange={setBodyType}
                    onRotate={rotate}
                    onHeadwearChange={(headwear) => {
                        setActivePreset("");
                        setAppearance((current) => ({ ...current, headwear }));
                    }}
                />
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
