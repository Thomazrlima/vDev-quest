import { createFileRoute } from "@tanstack/react-router";
import { SparkIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { ProfileSummary } from "./components/ProfileSummary";

const stats = [
    ["12", "Quests concluídas"],
    ["18.560", "EXP acumulada"],
] as const;

export const Route = createFileRoute("/_app/perfil/")({
    component: ProfilePage,
});

function ProfilePage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <ProfileSummary />
            <section className="mt-10 grid gap-4 sm:grid-cols-2">
                {stats.map(([value, label]) => (
                    <Card key={label} value={value} label={label} icon={<SparkIcon className="h-3 w-3 text-primary" />} className="p-5 text-center" />
                ))}
            </section>
        </main>
    );
}
