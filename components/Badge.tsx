const styles = {
  gold: "border-[#d99a2b] bg-[#5a3b12] text-[#f6cb68]",
  green: "border-[#6b8f45] bg-[#243c28] text-[#a8cf6b]",
  blue: "border-[#4c7792] bg-[#203947] text-[#8fc7e8]",
  purple: "border-[#82629b] bg-[#3b284d] text-[#c99bec]",
  silver: "border-[#9a9a8f] bg-[#3f423f] text-[#dddcd0]"
};

type BadgeProps = {
  tone?: keyof typeof styles;
  symbol?: string;
  label?: string;
  compact?: boolean;
};

export function Badge({ tone = "gold", symbol = "✦", label, compact = false }: BadgeProps) {
  return (
    <span
      title={label}
      className={`inline-flex items-center justify-center border-2 font-black shadow-[2px_2px_0_#060705] ${styles[tone]} ${compact ? "h-7 min-w-7 px-1 text-xs" : "h-9 min-w-9 gap-2 px-2 text-sm"}`}
    >
      <span aria-hidden="true">{symbol}</span>
      {label && !compact ? <span className="whitespace-nowrap text-[10px] uppercase tracking-wider">{label}</span> : null}
    </span>
  );
}
