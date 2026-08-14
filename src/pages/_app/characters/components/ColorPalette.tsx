import { Button } from "@/components/ui/Button";

/** Renders a ramp as horizontal bands so a swatch reads as the whole palette, not one colour. */
function bands(ramp: string[]) {
    const step = 100 / ramp.length;
    return `linear-gradient(180deg, ${ramp.map((color, index) => `${color} ${index * step}% ${(index + 1) * step}%`).join(",")})`;
}

export function ColorPalette({ ramps, value, onChange }: { ramps: string[][]; value: number; onChange: (index: number) => void }) {
    const active = value % ramps.length;

    return (
        <div className="mt-3 grid grid-cols-8 gap-1" role="radiogroup" aria-label="Cores disponíveis">
            {ramps.map((ramp, index) => (
                <Button key={ramp.join()} type="button" role="radio" aria-checked={index === active} aria-label={`Cor ${index + 1} de ${ramps.length}`} onClick={() => onChange(index)} style={{ backgroundImage: bands(ramp) }} className={`aspect-square h-auto w-full border-2 p-0 shadow-[1px_1px_0_var(--color-black)] hover:brightness-125 ${index === active ? "border-primary shadow-[0_0_0_2px_var(--color-primary),1px_1px_0_var(--color-black)]" : "border-[var(--color-primary-dark)]"}`} />
            ))}
        </div>
    );
}
