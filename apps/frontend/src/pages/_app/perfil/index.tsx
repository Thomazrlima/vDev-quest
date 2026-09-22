import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap } from "pixelarticons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BLEED_UNDER_RETURN_LINK, CLEAR_RETURN_LINK, HALL_PANEL } from "@/components/ui/StoneWall";
import { cn } from "@/lib/tailwind";
import { ProfileFeed } from "./components/ProfileFeed";
import { ProfileSettings } from "./components/ProfileSettings";
import { ProfileSummary } from "./components/ProfileSummary";
import { profileService } from "@/api/profile";
import { muralService } from "@/api/mural";

export const Route = createFileRoute("/_app/perfil/")({
    component: ProfilePage,
});

function ProfilePage() {
    const { data: profile, error } = useQuery({ queryKey: ["profile", "me"], queryFn: profileService.me });
    const { data: feed = [] } = useQuery({ queryKey: ["profile", "feed"], queryFn: muralService.feed });
    const stats = [
        [String(new Set(feed.filter((entry) => entry.submission.status === "ativa" && (entry.submission.phase ?? 0) >= entry.mission.phaseCount).map((entry) => entry.mission.id)).size), "Quests concluídas"],
        [new Intl.NumberFormat("pt-BR").format(profile?.xp ?? 0), "EXP acumulada"],
    ] as const;
    return (
        // Um salão só: a arte do perfil cobre a página inteira, sem segunda cena embaixo.
        <main className={cn("flex min-h-screen flex-col overflow-x-hidden bg-(--color-black) bg-[linear-gradient(rgb(15_14_14/52%),rgb(15_14_14/52%)),url('/images/backgrounds/Perfil.png')] bg-cover bg-fixed bg-center", BLEED_UNDER_RETURN_LINK)}>
            <div className={cn("flex-1 px-4 pb-9 sm:px-6 sm:pb-13", CLEAR_RETURN_LINK)}>
                <div className="mx-auto w-[min(1180px,100%)]">
                    {error ? <p role="alert" className="mb-5 border-2 border-red bg-red-overlay p-4 text-sm text-red-light">{error.message}</p> : null}
                    <ProfileSummary profile={profile} />
                    <section className="mt-10 grid gap-4 sm:grid-cols-2">
                        {stats.map(([value, label], index) => {
                            const Icon = index === 0 ? Trophy : Zap;
                            return <Card key={label} value={value} label={label} icon={<Icon className="h-3 w-3 text-primary" />} className={cn("p-5 text-center", HALL_PANEL)} />;
                        })}
                    </section>
                    <div className="mt-10">
                        <ProfileFeed />
                    </div>
                    <div className="mt-10">
                        <ProfileSettings />
                    </div>
                    {profile?.role === "manager" ? <section className="mt-10" aria-labelledby="admin-catalog-title">
                        <Card className={cn("p-5 sm:p-8", HALL_PANEL)}>
                            <p className="text-[.7rem] font-black uppercase tracking-[.14em] text-primary">Administração</p>
                            <h2 id="admin-catalog-title" className="mt-2 text-xl font-black text-primary-light">Títulos e insígnias</h2>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white-muted">Cadastre os reconhecimentos disponíveis para a guilda. Somente gestores podem acessar este catálogo.</p>
                            <Button asChild className="mt-6 px-5 py-3 text-[11px]"><Link to="/admin/catalog">Abrir catálogo</Link></Button>
                        </Card>
                    </section> : null}
                </div>
            </div>
        </main>
    );
}
