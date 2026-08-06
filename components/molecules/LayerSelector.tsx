import type { ComponentType, SVGProps } from "react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export function LayerSelector({ label, value, count, icon: Icon, enabled = false, onPrevious, onNext }: { label: string; value: string; count: string; icon: Icon; enabled?: boolean; onPrevious?: () => void; onNext?: () => void }) {
  return <div className={`creator-layer-selector ${enabled ? "creator-layer-selector--active" : ""}`}><span className="creator-layer-icon"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[9px] font-black uppercase tracking-[.14em] text-[#ad9361]">{label}</span><strong className="mt-1 block truncate text-xs text-[#eadab8]">{value}</strong></span><button type="button" aria-label={`Opção anterior de ${label}`} onClick={onPrevious} disabled={!enabled} className="creator-stone-arrow">‹</button><span className="w-9 text-center text-[9px] font-black text-[#b58a3e]">{count}</span><button type="button" aria-label={`Próxima opção de ${label}`} onClick={onNext} disabled={!enabled} className="creator-stone-arrow">›</button></div>;
}
