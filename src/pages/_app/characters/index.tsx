import { useEffect, useMemo, useState } from "react";
import { Sparkle } from "pixelarticons/react";
import { createFileRoute } from "@tanstack/react-router";
import { CharacterLayersPanel } from "./components/CharacterLayersPanel";
import { CharacterPresetPanel } from "./components/CharacterPresetPanel";
import { CharacterPreview } from "./components/CharacterPreview";
import { EMPTY_MANA_SEED_APPEARANCE } from "@/mocks/data/mana-seed";
import { Button } from "@/components/ui/Button";
import { QuestLoader } from "@/components/ui/QuestLoader";
import type { BodyType, CharacterPreset, ManaSeedAppearance, ManaSeedColors, ManaSeedLayer, ManaSeedSlot } from "@/types/character";
import { readStoredCharacter, saveStoredCharacter } from "@/utils/character-storage";
import { cycleManaSeedSlot, getManaSeedLayers } from "@/utils/mana-seed";
import { useSpritesReady } from "@/utils/use-sprites-ready";

export const Route = createFileRoute("/_app/characters/")({
    component: CharacterCreatorPage,
});

function CharacterCreatorPage() {
    // O vilarejo monta o avatar a partir do mesmo registro: a oficina abre no que já foi escolhido.
    const [storedCharacter] = useState(readStoredCharacter);
    const [appearance, setAppearance] = useState<ManaSeedAppearance>(storedCharacter.appearance);
    const [name, setName] = useState(storedCharacter.name);
    const [bodyType, setBodyType] = useState<BodyType>(storedCharacter.bodyType);
    const [activePreset, setActivePreset] = useState("");
    const [colors, setColors] = useState<ManaSeedColors>(storedCharacter.colors);
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

    // O vilarejo remonta o avatar a partir deste registro, então a cor e o corpo entram
    // junto com as peças: gravar só a aparência devolvia o herói nas rampas de teste.
    useEffect(() => {
        saveStoredCharacter({ appearance, name, colors, bodyType });
    }, [appearance, bodyType, colors, name]);

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
                <CharacterPreview name={name} onNameChange={setName} layers={paintedLayers} />
                <CharacterLayersPanel bodyType={bodyType} appearance={appearance} colors={colors} onBodyTypeChange={setBodyType} onRotate={rotate} onColorChange={changeColor} onReset={reset} />
            </div>
            <footer className="mt-6 flex justify-center">
                <p className="text-center text-[10px] font-black uppercase tracking-[.16em] text-[var(--color-primary-dark)]">Alterações salvas automaticamente</p>
            </footer>
            </div>
        </main>
    );
}
