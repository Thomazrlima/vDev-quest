import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Zap } from "pixelarticons/react";
import { Card } from "@/components/ui/Card";
import { BLEED_UNDER_RETURN_LINK, CLEAR_RETURN_LINK, HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
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
        // Um salão só: a arte do perfil cobre a página inteira, sem segunda cena embaixo.
        <main className={cn("flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) bg-[linear-gradient(rgb(15_14_14/52%),rgb(15_14_14/52%)),url('/images/backgrounds/Perfil.png')] bg-cover bg-fixed bg-center", BLEED_UNDER_RETURN_LINK)}>
            <div className={cn("flex-1 px-4 pb-9 sm:px-6 sm:pb-13", CLEAR_RETURN_LINK)}>
                <div className="mx-auto w-[min(1180px,100%)]">
                    <ProfileSummary />
                    <section className="mt-10 grid gap-4 sm:grid-cols-2">
                        {stats.map(([value, label], index) => {
                            const Icon = index === 0 ? Trophy : Zap;
                            return <Card key={label} value={value} label={label} icon={<Icon className="h-3 w-3 text-primary" />} className={cn("p-5 text-center", HALL_PANEL)} />;
                        })}
                    </section>
                    <div className="mt-10">
                        <ProfileSettings />
                    </div>
                </div>
            </div>
        </main>
    );
}
