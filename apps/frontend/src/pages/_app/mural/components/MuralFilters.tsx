import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/tailwind";
import { MURAL_FILTERS, type MuralFilter } from "@/types/mission";

export function MuralFilters({ value, onChange }: { value: MuralFilter; onChange: (value: MuralFilter) => void }) {
    return (
        <div role="tablist" aria-label="Estado das missões">
            <Slider className="flex flex-wrap gap-2" indicatorClassName="border-2 border-primary bg-primary-overlay" items={MURAL_FILTERS} value={value} getValue={(filter) => filter.value} onValueChange={onChange}>
                {(filter, { active, indicator, select }) => (
                    <Button key={filter.value} type="button" role="tab" aria-selected={active} onClick={select} variant="ghost" className={cn("h-11 border-2 border-primary-dark px-4 text-[.7rem] tracking-[.14em]", active ? "text-primary-light" : "text-white-muted hover:text-primary-light")}>
                        {indicator}
                        <span className="relative z-10 leading-none">{filter.label}</span>
                    </Button>
                )}
            </Slider>
        </div>
    );
}
