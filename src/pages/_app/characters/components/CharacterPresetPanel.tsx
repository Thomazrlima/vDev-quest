import { Button } from "@/components/ui/Button";
import { renderTextWithNumericFont } from "@/lib/typography";

import { MANA_SEED_ICONS } from "@/components/ManaSeed/slot-icons";
import { CHARACTER_PRESETS } from "@/mocks/data/character-options";
import type { CharacterPreset } from "@/types/character";

export function CharacterPresetPanel({ activePreset, onPreset }: { activePreset: string; onPreset: (preset: CharacterPreset) => void }) {
    return (
        <section className="border-[5px] border-[var(--color-orange-dark)] bg-[linear-gradient(135deg,var(--color-black-overlay),var(--color-black-overlay))] p-4 shadow-[0_0_0_3px_var(--color-orange-dark),6px_7px_0_var(--color-black-overlay),inset_0_0_0_2px_var(--color-orange-overlay)] sm:p-5" aria-label="Pre-sets de traje">
            <header className="flex items-center justify-between border-b-2 border-[var(--color-orange-dark)] pb-[.7rem] text-center text-white">
                <span>✦</span>
                <div>
                    <p className="m-0 text-[.85rem] font-black tracking-[.13em]">PRE-SETS</p>
                    <small className="mt-[.2rem] block text-[.56rem] font-black tracking-[.16em] text-[var(--color-orange)]">TRAJES DO HERÓI</small>
                </div>
                <span>✦</span>
            </header>
            <p className="mt-4 text-[.72rem] leading-[1.5] text-[var(--color-white-muted)]">Escolha um conjunto para equipar o aventureiro de uma vez.</p>
            {/*
             Três colunas fixas em vez de quebra automática: com `flex-wrap` a última linha sobrava
             com um ou dois quadrados soltos, e no painel largo os seis ficavam amontoados à
             esquerda. As bordas de cada linha encostam nas laterais e o do meio fica centrado.
            */}
            <div className="mt-4 grid grid-cols-3 gap-y-3 justify-items-center [&>*:nth-child(3n)]:justify-self-end [&>*:nth-child(3n+1)]:justify-self-start">
                {CHARACTER_PRESETS.map((preset) => {
                    const Icon = MANA_SEED_ICONS[preset.icon];
                    return (
                        <Button
                            type="button"
                            key={preset.id}
                            onClick={() => onPreset(preset)}
                            aria-pressed={activePreset === preset.id}
                            aria-label={`${preset.label} — ${preset.helper}`}
                            /*
                             O `brightness` do hover é um filtro, e filtro abre contexto de
                             empilhamento: o `z-20` do balão passa a valer só dentro do botão, que
                             sem z-index próprio fica atrás dos quadrados seguintes — a descrição da
                             primeira linha sumia debaixo da segunda. O z-index vai no botão.
                            */
                            className={`group relative h-14 w-14 shrink-0 border-[3px] bg-[var(--color-black)] p-0 text-[var(--color-orange-light)] shadow-[inset_2px_2px_0_var(--color-orange-overlay),3px_3px_0_var(--color-black)] hover:z-30 hover:brightness-110 focus-visible:z-30 ${activePreset === preset.id ? "border-primary bg-[var(--color-orange-dark)] shadow-[inset_0_0_0_2px_var(--color-orange-overlay),0_0_0_2px_var(--color-orange-dark),3px_3px_0_var(--color-black)]" : "border-[var(--color-orange-dark)]"}`}
                        >
                            <Icon className="h-8 w-8" />
                            <span className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-2 w-max max-w-45 -translate-x-1/2 border-2 border-[var(--color-orange)] bg-[var(--color-black)] px-2 py-1.5 text-left opacity-0 shadow-[3px_3px_0_var(--color-black-overlay)] transition-opacity group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100">
                                <strong className="block text-[11px] uppercase leading-none tracking-wide text-[var(--color-orange-light)]">{preset.label}</strong>
                                <small className="mt-1 block text-[10px] normal-case leading-tight tracking-normal text-[var(--color-white-muted)]">{preset.helper}</small>
                            </span>
                        </Button>
                    );
                })}
            </div>
            <aside className="mt-5 border-2 border-dashed border-[var(--color-orange-dark)] bg-[var(--color-black-overlay)] p-[.6rem] text-[.58rem] font-black uppercase leading-[1.45] text-[var(--color-orange)]">{renderTextWithNumericFont("O pacote atual fornece 17 cabelos, 16 chapéus e 13 camadas equipáveis. As cores de cada peça vêm prontas do sprite.")}</aside>
        </section>
    );
}
