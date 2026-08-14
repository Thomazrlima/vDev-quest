import { useCallback, useEffect, useState } from "react";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { LobbyMap } from "@/components/Lobby/LobbyMap";
import { QuestLoader } from "@/components/ui/QuestLoader";
import { LOBBY_DESTINATIONS } from "@/mocks/data/lobby-map";
import { readNavigationMode } from "@/utils/navigation-preference";
import { useCoarsePointer } from "@/utils/use-coarse-pointer";
import { useStoredCharacter } from "@/utils/use-stored-character";

/** Tempo do fade da abertura: precisa bater com `quest-loader-out` no CSS. */
const BOOT_FADE_MS = 260;
/** Rede de segurança: nenhuma falha de carregamento prende o vilarejo. */
const BOOT_TIMEOUT_MS = 6000;

export const Route = createFileRoute("/")({
    // Quem escolheu a barra de navegação não passa pelo vilarejo para chegar a lugar nenhum.
    // Decidido antes de montar a rota: pela tela, seria o mapa aparecendo por um quadro.
    beforeLoad: () => {
        if (readNavigationMode() === "navbar") throw redirect({ to: "/ranking" });
    },
    component: LobbyPage,
});

function LobbyPage() {
    const { name } = useStoredCharacter();
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

    return (
        <div className="lobby">
            <LobbyMap onReady={handleReady} />

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
                    <Link className="lobby__route" key={destination.href} to={destination.href}>
                        {destination.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
