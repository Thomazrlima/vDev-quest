import { SparkIcon } from "@/components/atoms/icons";
import { StatCard } from "@/components/atoms/StatCard";
import { ProfileSummary } from "@/components/organisms/ProfileSummary";
import { AppShell } from "@/components/templates/AppShell";

const stats = [["12", "Quests concluídas"], ["18.560", "EXP acumulada"]] as const;

export function ProfileTemplate() {
  return <AppShell width="max-w-6xl"><ProfileSummary /><section className="mt-10 grid gap-4 sm:grid-cols-2">{stats.map(([value, label]) => <StatCard key={label} value={value} label={label} icon={<SparkIcon className="h-3 w-3 text-gold" />} />)}</section></AppShell>;
}
