export function DetailCard({ label, value }: { label: string; value: string }) {
  return <article className="border-2 border-[#4d391b] bg-[#10120f] p-4"><h3 className="text-[10px] font-black uppercase tracking-wider text-gold-light">{label}</h3><p className="mt-2 text-sm font-bold text-[#e8dab9]">{value}</p></article>;
}
