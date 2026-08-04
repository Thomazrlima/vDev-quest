import type { ReactNode } from "react";

export function Field({ label, error, required = true, className = "", children }: { label: string; error?: string; required?: boolean; className?: string; children: ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-gold-light">{label}{required ? <span className="text-gold"> *</span> : null}</span>{children}{error ? <span className="mt-2 block text-[11px] font-bold text-[#e58c67]">{error}</span> : null}</label>;
}
