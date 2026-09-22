import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/api/profile";
import { LobbyReturnLink } from "@/components/Lobby/LobbyReturnLink";
import { NavBar } from "@/components/NavBar";
import { useNavigationMode } from "@/utils/use-navigation-mode";
import { useAuth } from "@/auth/useAuth";
import { LoginScreen } from "@/auth/LoginScreen";
import { QuestLoader } from "@/components/ui/QuestLoader";

export const Route = createFileRoute("/_app")({
    component: AppLayout,
});

function AppLayout() {
    const [navigationMode] = useNavigationMode();
    const usingNavBar = navigationMode === "navbar";
    const { ready, accessToken } = useAuth();
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const { data: profile, isPending, error } = useQuery({ queryKey: ["profile", "me"], queryFn: profileService.me, enabled: ready && Boolean(accessToken) });

    if (!ready) return <QuestLoader fullscreen hint="Abrindo o portal" label="Conferindo sua jornada..." />;
    if (!accessToken) return <LoginScreen />;
    if (isPending) return <QuestLoader fullscreen hint="Abrindo o portal" label="Carregando sua jornada..." />;
    if (error) return <div role="alert" className="min-h-screen bg-black p-8 text-sm text-red-light">{error.message}</div>;
    if (profile?.role !== "manager" && (pathname.startsWith("/missions") || pathname.startsWith("/moderation") || pathname.startsWith("/admin"))) return <div role="alert" className="min-h-screen bg-black p-8 text-sm text-red-light">Somente gestores podem acessar esta área.</div>;

    return (
        <div className="min-h-screen bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/quest-landscape.png')] bg-cover bg-fixed bg-center">
            {/* Uma coisa ou outra: com a barra ligada, o vilarejo deixa de ser o caminho de volta. */}
            {usingNavBar ? <NavBar isManager={profile?.role === "manager"} /> : <LobbyReturnLink />}
            {/*
             A barra é opaca e cobre exatamente o que reserva — cabeçalho de 5.5rem no desktop, abas
             de 3.5rem embaixo no celular —, então nada da paisagem aparece atrás dela. O atalho de
             volta só flutua: a faixa aqui existe para o texto não nascer debaixo dele, e a paisagem
             fica à mostra nela. Quem pinta arte de ponta a ponta sobe por baixo cancelando a medida.
            */}
            <div className={usingNavBar ? "[--lobby-return-allowance:0px] pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pt-22 md:pb-0" : "[--lobby-return-allowance:5rem] pt-(--lobby-return-allowance)"}>
                <Outlet />
            </div>
        </div>
    );
}
