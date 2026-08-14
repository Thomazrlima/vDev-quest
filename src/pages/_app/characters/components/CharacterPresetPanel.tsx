import { FaceIcon, PantsIcon, ShirtIcon, ShoeIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

import { CHARACTER_AURAS, CHARACTER_PRESETS } from "@/mocks/data/character-options";
import type { CharacterAura, CharacterPreset } from "@/types/character";

const icons = { shirt: ShirtIcon, face: FaceIcon, shoe: ShoeIcon, pants: PantsIcon };

export function CharacterPresetPanel({ activePreset, aura, onPreset, onAura }: { activePreset: string; aura: CharacterAura; onPreset: (preset: CharacterPreset) => void; onAura: (aura: CharacterAura) => void }) {
    return (
        <section className="border-[5px] border-[var(--color-orange-dark)] bg-[linear-gradient(135deg,var(--color-black-overlay),var(--color-black-overlay))] p-4 shadow-[0_0_0_3px_var(--color-orange-dark),6px_7px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-orange-overlay)] sm:p-5" aria-label="Pre-sets de traje e classe">
            <header className="flex items-center justify-between border-b-2 border-[var(--color-orange-dark)] pb-[.7rem] text-center text-white">
                <span>✦</span>
                <div>
                    <p className="m-0 text-[.78rem] font-black tracking-[.13em]">PRE-SETS</p>
                    <small className="mt-[.2rem] block text-[.5rem] font-black tracking-[.16em] text-[var(--color-orange)]">TRAJES DO HERÓI</small>
                </div>
                <span>✦</span>
            </header>
            <p className="mt-4 text-[.68rem] leading-[1.5] text-[var(--color-white-muted)]">Escolha um conjunto para equipar o aventureiro de uma vez.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
                {CHARACTER_PRESETS.map((preset) => {
                    const Icon = icons[preset.icon];
                    return (
                        <Button
                            type="button"
                            key={preset.id}
                            onClick={() => onPreset(preset)}
                            className={`min-h-[116px] border-[3px] bg-[var(--color-black)] p-[.6rem] text-center text-[var(--color-orange-light)] shadow-[inset_2px_2px_0_var(--color-orange-overlay),3px_3px_0_var(--color-black)] hover:brightness-105 ${activePreset === preset.id ? "border-primary bg-[var(--color-orange-dark)] shadow-[inset_0_0_0_2px_var(--color-orange-overlay),0_0_0_2px_var(--color-orange-dark),3px_3px_0_var(--color-black)]" : "border-[var(--color-orange-dark)]"}`}
                        >
                            <span className="mx-auto grid h-[2.4rem] w-[2.4rem] place-items-center border-2 border-[var(--color-orange-dark)] bg-[var(--color-orange-dark)] text-primary-light shadow-[inset_2px_2px_0_var(--color-orange-overlay)]">
                                <Icon className="h-7 w-7" />
                            </span>
                            <strong className="mt-2 block text-[10px] uppercase tracking-wide">{preset.label}</strong>
                            <small className="mt-1 block text-[8px] leading-tight opacity-75">{preset.helper}</small>
                        </Button>
                    );
                })}
            </div>
            <div className="mt-6 border-t-2 border-[var(--color-orange)] pt-5">
                <p className="text-[.56rem] font-black uppercase tracking-[.14em] text-[var(--color-orange)]">ESCOLHA SUA CLASSE</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                    {CHARACTER_AURAS.map((option) => (
                        <Button type="button" key={option.name} title={option.name} aria-label={`Classe ${option.name}`} onClick={() => onAura(option)} className={`overflow-hidden border-2 bg-[var(--color-black)] p-[3px] shadow-[2px_2px_0_var(--color-black)] hover:brightness-110 ${aura.name === option.name ? "border-primary bg-[var(--color-orange-dark)] shadow-[0_0_0_2px_var(--color-orange-dark),3px_3px_0_var(--color-black)]" : "border-[var(--color-orange-dark)]"}`}>
                            <img src={option.image} alt="" width={512} height={512} className="block aspect-square h-auto w-full [image-rendering:pixelated] object-cover" />
                            <small className="block truncate py-[.32rem_.08rem_.18rem] text-[.43rem] font-black uppercase leading-none tracking-[.02em] text-[var(--color-orange-light)]">{option.name}</small>
                        </Button>
                    ))}
                </div>
                <p className="mt-3 text-center text-[9px] font-black uppercase tracking-wider text-[var(--color-orange-light)]">Classe ativa: {aura.name}</p>
            </div>
            <aside className="mt-5 border-2 border-dashed border-[var(--color-orange-dark)] bg-[var(--color-black-overlay)] p-[.6rem] text-[.53rem] font-black uppercase leading-[1.45] text-[var(--color-orange)]">O pacote atual fornece 2 cabelos, 2 camisas e 1 acessório. Novas camadas surgem quando houver novos sprites.</aside>
        </section>
    );
}
