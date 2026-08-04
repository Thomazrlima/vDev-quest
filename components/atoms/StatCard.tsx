import type { ReactNode } from "react";

export function StatCard({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
  return <article className="border-2 border-[#4a371a] bg-[#10130f] p-5 text-center shadow-[4px_4px_0_#050605]"><strong className="block text-2xl font-black text-gold-light">{value}</strong><span className="mt-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#827e71]">{icon}{label}</span></article>;
}
