import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Zap } from "pixelarticons/react";
import { Card } from "@/components/ui/Card";
import { ProfileSettings } from "./components/ProfileSettings";
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
        <main className="min-h-[calc(100vh-9rem)] bg-[url('/images/backgrounds/Perfil.png')] bg-cover bg-fixed bg-center px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-6xl">
            <ProfileSummary />
            <section className="mt-10 grid gap-4 sm:grid-cols-2">
                {stats.map(([value, label], index) => {
                    const Icon = index === 0 ? Trophy : Zap;
                    return <Card key={label} value={value} label={label} icon={<Icon className="h-3 w-3 text-primary" />} className="p-5 text-center" />;
                })}
            </section>
            <div className="mt-10">
                <ProfileSettings />
            </div>
            </div>
        </main>
    );
}
