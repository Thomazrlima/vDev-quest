import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/auth/useAuth";
import { isOidcCallback } from "@/auth/oidc";
import { LoginScreen } from "@/auth/LoginScreen";
import { Logo } from "@/components/Logo";
import { LobbyMap } from "@/components/Lobby/LobbyMap";
import { QuestLoader } from "@/components/ui/QuestLoader";
import { LOBBY_DESTINATIONS } from "@/mocks/data/lobby-map";
import { readNavigationMode } from "@/utils/navigation-preference";
import { useCoarsePointer } from "@/utils/use-coarse-pointer";
import { useStoredCharacter } from "@/utils/use-stored-character";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/api/profile";

/** Tempo do fade da abertura: precisa bater com `quest-loader-out` no CSS. */
const BOOT_FADE_MS = 260;
/** Rede de segurança: nenhuma falha de carregamento prende o vilarejo. */
const BOOT_TIMEOUT_MS = 6000;

export const Route = createFileRoute("/")({
    // Quem escolheu a barra de navegação não passa pelo vilarejo para chegar a lugar nenhum.
    // Decidido antes de montar a rota: pela tela, seria o mapa aparecendo por um quadro.
    beforeLoad: ({ location }) => {
        if (isOidcCallback(location.searchStr)) return;
        if (readNavigationMode() === "navbar") throw redirect({ to: "/ranking" });
    },
    component: RootPage,
});

function RootPage() {
    const { ready, accessToken } = useAuth();
    if (!ready) return <QuestLoader fullscreen hint="Concluindo o login" label="Abrindo sua jornada..." />;
    if (!accessToken) return <LoginScreen />;
    if (readNavigationMode() === "navbar") return <Navigate to="/ranking" replace />;
    return <LobbyPage />;
}

function LobbyPage() {
    const character = useStoredCharacter();
    const { name } = character;
    const { data: profile, isPending: profilePending, error: profileError } = useQuery({ queryKey: ["profile", "me"], queryFn: profileService.me });
    const isManager = profile?.role === "manager";
    const [ready, setReady] = useState(false);
    const [booting, setBooting] = useState(true);
    const coarsePointer = useCoarsePointer();
    const handleReady = useCallback(() => setReady(true), []);

    // A arte do vilarejo é grande e o avatar ainda passa por um recolorir: seguramos a
    // abertura até os dois estarem prontos, senão o primeiro quadro é um vazio preto — ou
    // um herói vestido nas cores erradas até a pintura terminar.
    useEffect(() => {
        const timer = window.setTimeout(() => setBooting(false), ready ? BOOT_FADE_MS : BOOT_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [ready]);

    if (profileError || character.error) return <main role="alert" className="min-h-screen bg-black p-8 text-sm text-red-light">{profileError?.message ?? character.error?.message}</main>;
    if (profilePending || !character.ready) return <QuestLoader fullscreen hint="Abrindo o portal" label="Carregando sua jornada..." />;

    return (
        <div className="lobby">
            <LobbyMap onReady={handleReady} isManager={isManager} />

            {booting ? <QuestLoader fullscreen hint="Desenhando o vilarejo" label="Preparando a jornada..." leaving={ready} /> : null}

            <header className="lobby__hud">
                <Logo className="lobby__brand" imageClassName="lobby__brand-image" priority />
                <div className="lobby__hud-text">
                    <p className="lobby__hud-name">{name || "Aventureiro"}</p>
                    <p className="lobby__hud-hint">
                        {coarsePointer ? (
                            <>
                                <b>Toque</b> no caminho ou <b>arraste</b> para o manche
                            </>
                        ) : (
                            <>
                                <b>WASD</b>, <b>setas</b> ou <b>clique</b> no caminho
                            </>
                        )}
                    </p>
                </div>
            </header>

            {/* Rotas reais: leitores de tela e toque não dependem do teclado. */}
            <nav className="lobby__routes" aria-label="Destinos do vilarejo">
                {LOBBY_DESTINATIONS.map((destination) => (
                    <Link className="lobby__route" key={destination.href} to={destination.href === "/missions" && !isManager ? "/mural" : destination.href}>
                        {destination.href === "/missions" && !isManager ? "Mural de missões" : destination.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
