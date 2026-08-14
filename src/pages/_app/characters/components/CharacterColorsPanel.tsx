import { useState } from "react";
import { Smile } from "pixelarticons/react";
import { ColorPalette } from "./ColorPalette";
import { Button } from "@/components/ui/Button";
import { MANA_SEED_ICONS } from "@/components/ManaSeed/slot-icons";
import { MANA_SEED_SLOTS } from "@/mocks/data/mana-seed";
import type { BodyType, ManaSeedAppearance, ManaSeedColors, ManaSeedSlot } from "@/types/character";
import { getManaSeedRampKind, getManaSeedSlot, MANA_SEED_RAMPS } from "@/utils/mana-seed";

type ColorTarget = ManaSeedSlot | "skin";

export function CharacterColorsPanel({ appearance, bodyType, colors, onChange }: { appearance: ManaSeedAppearance; bodyType: BodyType; colors: ManaSeedColors; onChange: (target: ColorTarget, index: number) => void }) {
    const [target, setTarget] = useState<ColorTarget>("skin");
    // Only the body and the parts currently equipped with a ramp-based sheet can be recoloured;
    // the `01`…`05` hats ship pre-painted and drop out of this list on their own.
    const targets = (["skin", ...MANA_SEED_SLOTS.map((definition) => definition.slot)] as ColorTarget[]).filter((entry) => getManaSeedRampKind(entry, appearance, bodyType) !== null);
    const active = targets.includes(target) ? target : "skin";
    const kind = getManaSeedRampKind(active, appearance, bodyType);

    return (
        <div className="mt-3">
            <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Peça a colorir">
                {targets.map((entry) => {
                    const label = entry === "skin" ? "Pele" : getManaSeedSlot(entry).label;
                    const Icon = entry === "skin" ? Smile : MANA_SEED_ICONS[getManaSeedSlot(entry).icon];
                    return (
                        <Button key={entry} type="button" onClick={() => setTarget(entry)} aria-pressed={entry === active} aria-label={`Colorir ${label}`} title={label} className={`aspect-square h-auto w-full border-2 p-0 shadow-[2px_2px_0_var(--color-black)] ${entry === active ? "border-primary bg-primary text-[var(--color-black)]" : "border-[var(--color-primary-dark)] bg-[var(--color-black)] text-primary"}`}>
                            <Icon className="h-6 w-6" />
                        </Button>
                    );
                })}
            </div>
            <p className="mt-4 text-[.66rem] font-black uppercase tracking-[.14em] text-primary">{active === "skin" ? "Tom de pele" : `Cor · ${getManaSeedSlot(active).label}`}</p>
            {kind ? <ColorPalette ramps={MANA_SEED_RAMPS[kind]} value={colors[active]} onChange={(index) => onChange(active, index)} /> : null}
            <p className="mt-3 text-[10px] font-bold leading-[1.5] text-[var(--color-white-muted)]">As peças vêm pintadas com rampas de teste; a cor escolhida troca a rampa inteira do sprite.</p>
        </div>
    );
}
