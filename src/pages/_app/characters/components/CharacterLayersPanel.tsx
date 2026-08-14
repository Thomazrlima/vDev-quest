import { useState } from "react";
import { Sparkle, User, UserSharp } from "pixelarticons/react";
import { Button } from "@/components/ui/Button";
import { CharacterColorsPanel } from "./CharacterColorsPanel";
import { Input } from "@/components/ui/Input";
import { LayerSelector } from "./LayerSelector";
import { MANA_SEED_ICONS } from "@/components/ManaSeed/slot-icons";
import type { BodyType, ManaSeedAppearance, ManaSeedColors, ManaSeedSlot } from "@/types/character";
import { getManaSeedItemLabel, getManaSeedSlot, getManaSeedSlotCount } from "@/utils/mana-seed";

const GROUPS: { id: string; label: string; slots: ManaSeedSlot[] }[] = [
    { id: "head", label: "Cabeça", slots: ["hair", "headwear", "face"] },
    { id: "outfit", label: "Roupas", slots: ["shirt", "pants", "overalls", "skirt", "outer"] },
    { id: "gear", label: "Acessórios", slots: ["socks", "shoes", "boots", "hands", "neck"] },
    { id: "colors", label: "Cores", slots: [] },
];

type CharacterLayersPanelProps = {
    name: string;
    bodyType: BodyType;
    appearance: ManaSeedAppearance;
    colors: ManaSeedColors;
    onNameChange: (value: string) => void;
    onBodyTypeChange: (value: BodyType) => void;
    onRotate: (slot: ManaSeedSlot, direction: -1 | 1) => void;
    onColorChange: (target: ManaSeedSlot | "skin", index: number) => void;
    onReset: () => void;
};

export function CharacterLayersPanel({ name, bodyType, appearance, colors, onNameChange, onBodyTypeChange, onRotate, onColorChange, onReset }: CharacterLayersPanelProps) {
    const [group, setGroup] = useState(GROUPS[0].id);
    const activeGroup = GROUPS.find((entry) => entry.id === group) ?? GROUPS[0];

    return (
        <section className="flex h-auto min-h-0 min-w-0 flex-col overflow-hidden border-[5px] border-[var(--color-primary-dark)] bg-[linear-gradient(135deg,var(--color-black-overlay),var(--color-black-overlay))] p-4 shadow-[0_0_0_3px_var(--color-primary-dark),6px_7px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-primary-overlay)] sm:p-5 xl:h-[45rem]" aria-label="Seletores de camadas">
            <header className="flex items-center justify-between border-b-2 border-[var(--color-primary-dark)] pb-[.7rem] text-center text-white">
                <Sparkle className="h-4 w-4" />
                <div>
                    <p className="m-0 text-[.85rem] font-black tracking-[.13em]">CRIAR SEU HERÓI</p>
                    <small className="mt-[.2rem] block text-[.56rem] font-black tracking-[.16em] text-primary">CAMADAS DO SPRITE</small>
                </div>
                <Sparkle className="h-4 w-4" />
            </header>
            <Input label="Nome do herói" value={name} maxLength={18} onChange={(event) => onNameChange(event.target.value)} containerClassName="mt-5" className="border-[3px] border-[var(--color-primary-dark)] bg-[var(--color-black)] p-[.7rem] text-[.85rem] font-black shadow-[inset_3px_3px_0_var(--color-primary-overlay)] focus:border-primary" />
            <div className="mt-4 flex flex-col gap-2">
                <span className="text-[.66rem] font-black uppercase tracking-[.14em] text-primary">BASE</span>
                <div className="flex flex-wrap items-center gap-2">
                    {(["hero", "heroine"] as const).map((type) => (
                        <Button
                            key={type}
                            type="button"
                            onClick={() => onBodyTypeChange(type)}
                            aria-pressed={bodyType === type}
                            aria-label={type === "hero" ? "Base de herói" : "Base de heroína"}
                            className={`flex h-10 min-w-24 items-center justify-center gap-1.5 rounded-none border-[3px] bg-[var(--color-black)] px-2 text-[.62rem] font-black uppercase tracking-[.08em] shadow-[2px_2px_0_var(--color-black)] ${bodyType === type ? "border-primary bg-primary text-[var(--color-black)] shadow-[0_0_0_2px_var(--color-primary-dark),2px_2px_0_var(--color-black)]" : "border-[var(--color-primary-dark)] text-[var(--color-white-muted)]"}`}
                        >
                            {type === "hero" ? <UserSharp className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            <span>{type === "hero" ? "Herói" : "Heroína"}</span>
                        </Button>
                    ))}
                    <small className="max-w-32 text-[10px] font-bold leading-tight text-[var(--color-white-muted)]">Muda o corte das roupas</small>
                </div>
            </div>
            {/* Two rows rather than four across: "ACESSÓRIOS" cannot grow past ~.58rem in a quarter of this panel. */}
            <div className="mt-5 grid grid-cols-2 gap-1.5" role="tablist" aria-label="Grupos de camadas">
                {GROUPS.map((entry) => (
                    <Button key={entry.id} type="button" role="tab" aria-selected={group === entry.id} onClick={() => setGroup(entry.id)} className={`border-2 px-1 py-[.6rem] text-[.75rem] leading-none tracking-[.06em] shadow-[2px_2px_0_var(--color-black)] ${group === entry.id ? "border-primary bg-primary text-[var(--color-black)]" : "border-[var(--color-primary-dark)] bg-[var(--color-black)] text-primary"}`}>
                        {entry.label.toUpperCase()}
                    </Button>
                ))}
            </div>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
                {activeGroup.id === "colors" ? (
                    <CharacterColorsPanel appearance={appearance} bodyType={bodyType} colors={colors} onChange={onColorChange} />
                ) : (
                    <div className="grid content-start gap-2">
                        {activeGroup.slots.map((slot) => {
                            const definition = getManaSeedSlot(slot);
                            return <LayerSelector key={slot} label={definition.label} value={getManaSeedItemLabel(slot, appearance[slot])} count={getManaSeedSlotCount(appearance, slot)} icon={MANA_SEED_ICONS[definition.icon]} enabled onPrevious={() => onRotate(slot, -1)} onNext={() => onRotate(slot, 1)} />;
                        })}
                    </div>
                )}
            </div>
            <div className="mt-5 shrink-0 border-t-2 border-[var(--color-primary-dark)] pt-4">
                <Button type="button" variant="ghost" onClick={onReset} className="w-full border-2 border-[var(--color-primary-dark)] bg-[var(--color-black)] py-[.6rem] text-[.62rem] tracking-[.1em] text-primary shadow-[2px_2px_0_var(--color-black)]">
                    LIMPAR EQUIPAMENTO
                </Button>
                <p className="mt-3 text-[10px] font-bold leading-[1.5] text-[var(--color-white-muted)]">Calça, macacão e saia dividem a mesma camada — escolher um libera os outros.</p>
            </div>
        </section>
    );
}
